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
    freq = 7 if loan.term_frequency == "WEEKLY" else 30
    if loan.repayment_type == "FLAT":
        # interest each period, principal at end
        interest_only = loan.principal * loan.interest_rate_percent / 100 / loan.term_units
        for i in range(loan.term_units):
            due = loan.start_date + timedelta(days=freq * i)
            amount = interest_only if i < loan.term_units - 1 else interest_only + loan.principal
            db.add(Payment(loan_id=loan.id, due_date=due, amount_due=amount))
    else:  # AMORTISED
        r = loan.interest_rate_percent / 100 / loan.term_units
        pmt = loan.principal * r / (1 - (1 + r) ** (-loan.term_units))
        for i in range(loan.term_units):
            due = loan.start_date + timedelta(days=freq * i)
            db.add(Payment(loan_id=loan.id, due_date=due, amount_due=round(pmt, 2)))
    
    await db.commit() 