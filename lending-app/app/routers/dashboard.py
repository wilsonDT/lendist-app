from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import Dict, Any

from app.core.database import get_session
from app.models.loan import Loan
from app.models.payment import Payment
from app.models.borrower import Borrower
from datetime import date, timedelta

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
    
    # Get all active loans with outstanding balances
    # Calculate the total loans value (includes both principal and interest)
    outstanding_balance_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .where(Payment.amount_paid < Payment.amount_due)
    )
    outstanding_balance = outstanding_balance_result.scalar() or 0
    
    # Also get the principal sum for historical comparison
    principal_result = await db.execute(select(func.sum(Loan.principal)))
    principal_sum = principal_result.scalar() or 0
    
    # Use the sum of outstanding balances as the total loans amount
    total_loans_amount = outstanding_balance
    
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
    
    # Calculate percentage changes (if possible)
    # For loans, try to compare with previous week's data
    last_week = today - timedelta(days=7)
    
    # For outstanding balances, get last week's data
    last_week_outstanding_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .join(Loan, Payment.loan_id == Loan.id)
        .where(Loan.created_at <= last_week, Payment.amount_paid < Payment.amount_due)
    )
    last_week_outstanding = last_week_outstanding_result.scalar() or 1  # avoid division by zero
    
    # For borrowers, compare with previous week
    last_week_borrowers_result = await db.execute(
        select(func.count())
        .select_from(Borrower)
        .where(Borrower.created_at <= last_week)
    )
    last_week_borrowers = last_week_borrowers_result.scalar() or 1  # avoid division by zero
    
    # Calculate percentage changes
    if last_week_outstanding > 0 and total_loans_amount > 0:
        loans_change = round(((total_loans_amount - last_week_outstanding) / last_week_outstanding) * 100)
    else:
        loans_change = 0
        
    if last_week_borrowers > 0 and active_borrowers > 0:
        borrowers_change = round(((active_borrowers - last_week_borrowers) / last_week_borrowers) * 100)
    else:
        borrowers_change = 0
    
    return {
        "active_borrowers": int(active_borrowers),
        "total_loans_amount": float(total_loans_amount),
        "due_today": float(due_today),
        "overdue_amount": float(overdue_amount),
        "loans_change": int(loans_change),
        "borrowers_change": int(borrowers_change)
    } 