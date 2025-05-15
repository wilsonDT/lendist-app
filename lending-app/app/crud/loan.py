from sqlmodel import select, Session, delete
from sqlalchemy.orm import selectinload
from app.models.loan import Loan
from app.models.payment import Payment
from app.schemas.loan import LoanCreate, LoanUpdate
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime

async def create_loan(db: Session, loan: LoanCreate, user_id: str) -> Loan:
    db_loan = Loan(**loan.model_dump(), user_id=user_id)
    db.add(db_loan)
    await db.commit()
    await db.refresh(db_loan)
    
    # Generate payment schedule
    await generate_schedule(db, db_loan, user_id=user_id)
    
    return db_loan

async def get_loan(db: Session, loan_id: int, user_id: str) -> Optional[Loan]:
    result = await db.execute(
        select(Loan).where(Loan.id == loan_id).where(Loan.user_id == user_id)
    )
    return result.scalars().first()

async def get_loans(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Loan]:
    result = await db.execute(
        select(Loan).where(Loan.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_loans_by_borrower(db: Session, borrower_id: int, user_id: str) -> List[Loan]:
    result = await db.execute(
        select(Loan).where(Loan.borrower_id == borrower_id).where(Loan.user_id == user_id)
    )
    return result.scalars().all()

async def update_loan(db: Session, loan_id: int, loan_update_data: LoanUpdate, user_id: str) -> Optional[Loan]:
    db_loan = await get_loan(db, loan_id, user_id=user_id)
    if not db_loan:
        return None
    
    update_data = loan_update_data.model_dump(exclude_unset=True)
    if 'user_id' in update_data:
        del update_data['user_id']
        
    for key, value in update_data.items():
        setattr(db_loan, key, value)
    
    await db.commit()
    await db.refresh(db_loan)
    return db_loan

async def delete_loan(db: Session, loan_id: int, user_id: str) -> bool:
    db_loan = await get_loan(db, loan_id, user_id=user_id)
    if not db_loan:
        return False
    
    await db.delete(db_loan)
    await db.commit()
    return True

async def renew_loan(db: Session, loan_id: int, user_id: str) -> Optional[Loan]:
    result = await db.execute(
        select(Loan).options(selectinload(Loan.payments))
        .where(Loan.id == loan_id)
        .where(Loan.user_id == user_id)
    )
    original_loan = result.scalars().first()

    if not original_loan:
        return None

    if original_loan.status in ["completed", "cancelled"]:
        return None

    for payment in original_loan.payments:
        if payment.paid_at is None or payment.amount_paid < payment.amount_due:
            payment.amount_paid = payment.amount_due
            payment.paid_at = datetime.utcnow()
            db.add(payment)

    original_loan.status = "completed"
    db.add(original_loan)

    await db.commit()

    new_loan_data = LoanCreate(
        borrower_id=original_loan.borrower_id,
        principal=original_loan.principal,
        interest_rate_percent=original_loan.interest_rate_percent,
        term_units=original_loan.term_units,
        term_frequency=original_loan.term_frequency,
        repayment_type=original_loan.repayment_type,
        interest_cycle=original_loan.interest_cycle,
        start_date=date.today()
    )

    newly_created_loan = await create_loan(db, new_loan_data, user_id=user_id)
    
    return newly_created_loan

async def generate_schedule(db: Session, loan: Loan, user_id: str) -> None:
    interest_cycle = getattr(loan, 'interest_cycle', 'yearly')
    start_date = loan.start_date
    
    if loan.term_frequency.lower() == 'daily':
        next_due_date = start_date + timedelta(days=1)
    elif loan.term_frequency.lower() == 'weekly':
        next_due_date = start_date + timedelta(days=7)
    elif loan.term_frequency.lower() == 'monthly':
        next_due_date = add_months(start_date, 1)
    elif loan.term_frequency.lower() == 'quarterly':
        next_due_date = add_months(start_date, 3)
    elif loan.term_frequency.lower() == 'yearly':
        next_due_date = add_months(start_date, 12)
    else:
        next_due_date = add_months(start_date, 1)
    
    annual_rate = loan.interest_rate_percent
    if interest_cycle.lower() == 'one-time':
        annual_rate = loan.interest_rate_percent
    elif interest_cycle.lower() == 'daily':
        annual_rate = loan.interest_rate_percent * 365
    elif interest_cycle.lower() == 'weekly':
        annual_rate = loan.interest_rate_percent * 52
    elif interest_cycle.lower() == 'monthly':
        annual_rate = loan.interest_rate_percent * 12
    
    periodic_rate = annual_rate
    if loan.term_frequency.lower() == 'daily':
        periodic_rate = annual_rate / 365
    elif loan.term_frequency.lower() == 'weekly':
        periodic_rate = annual_rate / 52
    elif loan.term_frequency.lower() == 'monthly':
        periodic_rate = annual_rate / 12
    elif loan.term_frequency.lower() == 'quarterly':
        periodic_rate = annual_rate / 4
    
    if loan.repayment_type.lower() == 'flat':
        interest_per_period = (loan.principal * periodic_rate) / 100
        principal_per_period = loan.principal / loan.term_units
        payment_amount = principal_per_period + interest_per_period
        
        for i in range(loan.term_units):
            if i > 0:
                if loan.term_frequency.lower() == 'daily':
                    next_due_date = next_due_date + timedelta(days=1)
                elif loan.term_frequency.lower() == 'weekly':
                    next_due_date = next_due_date + timedelta(days=7)
                elif loan.term_frequency.lower() == 'monthly':
                    next_due_date = add_months(next_due_date, 1)
                elif loan.term_frequency.lower() == 'quarterly':
                    next_due_date = add_months(next_due_date, 3)
                elif loan.term_frequency.lower() == 'yearly':
                    next_due_date = add_months(next_due_date, 12)
            
            db.add(Payment(
                loan_id=loan.id, 
                user_id=user_id,
                due_date=next_due_date, 
                amount_due=round(payment_amount, 2)
            ))
    else:  # Amortized loans
        rate = periodic_rate / 100
        payment_amount = loan.principal * rate / (1 - (1 + rate) ** (-loan.term_units))
        remaining_principal = loan.principal
        
        for i in range(loan.term_units):
            if i > 0:
                if loan.term_frequency.lower() == 'daily':
                    next_due_date = next_due_date + timedelta(days=1)
                elif loan.term_frequency.lower() == 'weekly':
                    next_due_date = next_due_date + timedelta(days=7)
                elif loan.term_frequency.lower() == 'monthly':
                    next_due_date = add_months(next_due_date, 1)
                elif loan.term_frequency.lower() == 'quarterly':
                    next_due_date = add_months(next_due_date, 3)
                elif loan.term_frequency.lower() == 'yearly':
                    next_due_date = add_months(next_due_date, 12)
            
            interest_payment = remaining_principal * rate
            principal_payment = payment_amount - interest_payment
            remaining_principal -= principal_payment
            
            db.add(Payment(
                loan_id=loan.id, 
                user_id=user_id,
                due_date=next_due_date, 
                amount_due=round(payment_amount, 2)
            ))
    
    await db.commit()

def add_months(date_obj, months):
    """Add a specified number of months to a date object."""
    month = date_obj.month - 1 + months
    year = date_obj.year + month // 12
    month = month % 12 + 1
    day = min(date_obj.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1])
    return date(year, month, day) 