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
    
    # Count total borrowers
    borrower_count_result = await db.execute(select(func.count()).select_from(Borrower))
    borrower_count = borrower_count_result.scalar() or 0
    
    # Count active loans
    loan_count_result = await db.execute(select(func.count()).select_from(Loan))
    loan_count = loan_count_result.scalar() or 0
    
    # Sum total principal amount
    principal_result = await db.execute(select(func.sum(Loan.principal)))
    total_principal = principal_result.scalar() or 0
    
    # Sum due payments (outstanding)
    due_payments_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .where(Payment.due_date <= today, Payment.amount_paid < Payment.amount_due)
    )
    total_outstanding = due_payments_result.scalar() or 0
    
    # Get overdue count
    overdue_result = await db.execute(
        select(func.count())
        .select_from(Payment)
        .where(Payment.due_date < today, Payment.amount_paid < Payment.amount_due)
    )
    overdue_count = overdue_result.scalar() or 0
    
    return {
        "borrower_count": borrower_count,
        "loan_count": loan_count,
        "total_principal": total_principal,
        "total_outstanding": total_outstanding,
        "overdue_count": overdue_count
    } 