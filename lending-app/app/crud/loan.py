from sqlmodel import select, Session
from app.models.loan import Loan
from app.models.payment import Payment
from app.schemas.loan import LoanCreate, LoanUpdate
from typing import List, Optional, Dict, Any
from datetime import date, timedelta

async def create_loan(db: Session, loan: LoanCreate) -> Loan:
    db_loan = Loan(**loan.model_dump())
    db.add(db_loan)
    await db.commit()
    await db.refresh(db_loan)
    
    # Generate payment schedule
    await generate_schedule(db, db_loan)
    
    return db_loan

async def get_loan(db: Session, loan_id: int) -> Optional[Loan]:
    # Use a simple select to avoid loading relationships
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    return result.scalars().first()

async def get_loans(db: Session, skip: int = 0, limit: int = 100) -> List[Loan]:
    result = await db.execute(select(Loan).offset(skip).limit(limit))
    return result.scalars().all()

async def get_loans_by_borrower(db: Session, borrower_id: int) -> List[Loan]:
    result = await db.execute(select(Loan).where(Loan.borrower_id == borrower_id))
    return result.scalars().all()

async def update_loan(db: Session, loan_id: int, loan: LoanUpdate) -> Optional[Loan]:
    db_loan = await get_loan(db, loan_id)
    if not db_loan:
        return None
    
    loan_data = loan.model_dump(exclude_unset=True)
    for key, value in loan_data.items():
        setattr(db_loan, key, value)
    
    await db.commit()
    await db.refresh(db_loan)
    return db_loan

async def delete_loan(db: Session, loan_id: int) -> bool:
    db_loan = await get_loan(db, loan_id)
    if not db_loan:
        return False
    
    await db.delete(db_loan)
    await db.commit()
    return True

async def generate_schedule(db: Session, loan: Loan) -> None:
    # Set default interest cycle if not specified
    interest_cycle = getattr(loan, 'interest_cycle', 'yearly')
    
    # Start with the loan's start date
    start_date = loan.start_date
    
    # Calculate the first payment due date (one term period after start date)
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
        # Default to monthly if frequency not recognized
        next_due_date = add_months(start_date, 1)
    
    # Calculate annual interest rate based on interest cycle
    annual_rate = loan.interest_rate_percent
    if interest_cycle.lower() == 'one-time':
        annual_rate = loan.interest_rate_percent
    elif interest_cycle.lower() == 'daily':
        annual_rate = loan.interest_rate_percent * 365
    elif interest_cycle.lower() == 'weekly':
        annual_rate = loan.interest_rate_percent * 52
    elif interest_cycle.lower() == 'monthly':
        annual_rate = loan.interest_rate_percent * 12
    
    # Calculate periodic rate based on payment frequency
    periodic_rate = annual_rate
    if loan.term_frequency.lower() == 'daily':
        periodic_rate = annual_rate / 365
    elif loan.term_frequency.lower() == 'weekly':
        periodic_rate = annual_rate / 52
    elif loan.term_frequency.lower() == 'monthly':
        periodic_rate = annual_rate / 12
    elif loan.term_frequency.lower() == 'quarterly':
        periodic_rate = annual_rate / 4
    
    # Create the schedule based on repayment type
    if loan.repayment_type.lower() == 'flat':
        # Flat loans: interest calculated on full principal
        interest_per_period = (loan.principal * periodic_rate) / 100
        principal_per_period = loan.principal / loan.term_units
        payment_amount = principal_per_period + interest_per_period
        
        for i in range(loan.term_units):
            # First payment date was already calculated above, so only calculate subsequent dates
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
                due_date=next_due_date, 
                amount_due=round(payment_amount, 2)
            ))
    else:  # Amortized loans
        # Convert periodic rate to decimal
        rate = periodic_rate / 100
        # Calculate payment using amortization formula
        payment = loan.principal * rate / (1 - (1 + rate) ** (-loan.term_units))
        
        remaining_principal = loan.principal
        
        for i in range(loan.term_units):
            # First payment date was already calculated above, so only calculate subsequent dates
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
            
            # Calculate interest component of this payment
            interest_payment = remaining_principal * rate
            # Calculate principal component of this payment
            principal_payment = payment - interest_payment
            # Update remaining principal
            remaining_principal -= principal_payment
            
            db.add(Payment(
                loan_id=loan.id, 
                due_date=next_due_date, 
                amount_due=round(payment, 2)
            ))
    
    await db.commit()

# Helper function to add months to a date
def add_months(date_obj, months):
    """Add a specified number of months to a date object."""
    month = date_obj.month - 1 + months
    year = date_obj.year + month // 12
    month = month % 12 + 1
    day = min(date_obj.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1])
    return date(year, month, day) 