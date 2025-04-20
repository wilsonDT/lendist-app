from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import Dict, Any

from app.core.database import get_session
from app.models.loan import Loan
from app.models.payment import Payment
from app.models.borrower import Borrower
from datetime import date

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_session)):
    today = date.today()
    
    # Count active borrowers
    borrower_count_result = await db.execute(select(func.count()).select_from(Borrower))
    active_borrowers = borrower_count_result.scalar() or 0
    
    # Count loans
    loan_count_result = await db.execute(select(func.count()).select_from(Loan))
    loan_count = loan_count_result.scalar() or 0
    
    # Sum total principal amount
    principal_result = await db.execute(select(func.sum(Loan.principal)))
    total_loans_amount = principal_result.scalar() or 0
    
    # Sum payments due today
    due_today_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .where(Payment.due_date == today, Payment.amount_paid < Payment.amount_due)
    )
    due_today = due_today_result.scalar() or 0
    
    # Sum overdue payments
    overdue_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .where(Payment.due_date < today, Payment.amount_paid < Payment.amount_due)
    )
    overdue_amount = overdue_result.scalar() or 0
    
    # Hardcoded percentage changes for now (would be calculated from historical data)
    loans_change = 5
    borrowers_change = 2
    
    return {
        "active_borrowers": active_borrowers,
        "total_loans_amount": total_loans_amount,
        "due_today": due_today,
        "overdue_amount": overdue_amount,
        "loans_change": loans_change,
        "borrowers_change": borrowers_change
    } 