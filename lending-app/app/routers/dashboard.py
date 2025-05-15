from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import Dict, Any, List
from sqlalchemy import extract

from app.core.database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.models.loan import Loan
from app.models.payment import Payment
from app.models.borrower import Borrower
from datetime import date, timedelta, datetime
import calendar

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    today = date.today()
    user_id = current_user.id
    
    # Count active borrowers
    borrower_count_result = await db.execute(select(func.count()).select_from(Borrower).where(Borrower.user_id == user_id))
    active_borrowers = borrower_count_result.scalar() or 0
    
    # Count loans
    loan_count_result = await db.execute(select(func.count()).select_from(Loan).where(Loan.user_id == user_id))
    loan_count = loan_count_result.scalar() or 0
    
    # Get all active loans with outstanding balances
    # Calculate the total loans value (includes both principal and interest)
    outstanding_balance_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .join(Loan, Payment.loan_id == Loan.id)
        .where(Payment.amount_paid < Payment.amount_due, Loan.user_id == user_id)
    )
    outstanding_balance = outstanding_balance_result.scalar() or 0
    
    # Also get the principal sum for historical comparison
    principal_result = await db.execute(select(func.sum(Loan.principal)).where(Loan.user_id == user_id))
    principal_sum = principal_result.scalar() or 0
    
    # Use the sum of outstanding balances as the total loans amount
    total_loans_amount = outstanding_balance
    
    # Sum payments due today
    due_today_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .join(Loan, Payment.loan_id == Loan.id)
        .where(Payment.due_date == today, Payment.amount_paid < Payment.amount_due, Loan.user_id == user_id)
    )
    due_today = due_today_result.scalar() or 0
    
    # Sum overdue payments
    overdue_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .join(Loan, Payment.loan_id == Loan.id)
        .where(Payment.due_date < today, Payment.amount_paid < Payment.amount_due, Loan.user_id == user_id)
    )
    overdue_amount = overdue_result.scalar() or 0
    
    # Calculate percentage changes (if possible)
    # For loans, try to compare with previous week's data
    last_week = today - timedelta(days=7)
    
    # For outstanding balances, get last week's data
    last_week_outstanding_result = await db.execute(
        select(func.sum(Payment.amount_due - Payment.amount_paid))
        .join(Loan, Payment.loan_id == Loan.id)
        .where(Loan.created_at <= last_week, Payment.amount_paid < Payment.amount_due, Loan.user_id == user_id)
    )
    last_week_outstanding = last_week_outstanding_result.scalar() or 1  # avoid division by zero
    
    # For borrowers, compare with previous week
    last_week_borrowers_result = await db.execute(
        select(func.count())
        .select_from(Borrower)
        .where(Borrower.created_at <= last_week, Borrower.user_id == user_id)
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

@router.get("/expected-profit", response_model=List[Dict[str, Any]])
async def get_expected_monthly_profit(
    months: int = 12,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate expected profit per month for the next X months (default 12).
    This endpoint returns data for dashboard graphs showing projected earnings.
    """
    today = date.today()
    result = []
    user_id = current_user.id
    
    # Calculate the expected profit for each month
    for i in range(months):
        # Calculate the month we're looking at
        target_month = today.month + i
        target_year = today.year + (target_month - 1) // 12
        target_month = ((target_month - 1) % 12) + 1
        
        # Get the first and last day of the target month
        first_day = date(target_year, target_month, 1)
        last_day = date(target_year, target_month, 
                        calendar.monthrange(target_year, target_month)[1])
        
        # Query for expected payments in this month from active loans
        # For profit calculation, we only consider the interest portion of payments
        query = select(
            func.sum(Payment.amount_due - Payment.amount_paid)
        ).join(
            Loan, Payment.loan_id == Loan.id
        ).where(
            Payment.due_date >= first_day,
            Payment.due_date <= last_day,
            Loan.status == "active",
            Loan.user_id == user_id
        )
        
        total_due_result = await db.execute(query)
        total_due = total_due_result.scalar() or 0
        
        # Get principal portion from the same time period to calculate interest
        principal_query = select(
            func.sum(Loan.principal / Loan.term_units)
        ).join(
            Payment, Payment.loan_id == Loan.id
        ).where(
            Payment.due_date >= first_day,
            Payment.due_date <= last_day,
            Loan.status == "active",
            Loan.user_id == user_id
        )
        
        principal_result = await db.execute(principal_query)
        principal_portion = principal_result.scalar() or 0
        
        # Calculate expected profit (total due minus principal portion)
        expected_profit = max(0, total_due - principal_portion)
        
        # Add to results
        result.append({
            "month": f"{calendar.month_name[target_month]} {target_year}",
            "month_key": f"{target_year}-{target_month:02d}",
            "expected_profit": round(expected_profit, 2)
        })
    
    return result 