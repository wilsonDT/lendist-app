from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from datetime import date, timedelta
from sqlmodel import select, join

from app.core.database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.payment import PaymentResponse
from app.crud import payment as payment_crud
from app.models.payment import Payment
from app.models.loan import Loan
from app.models.borrower import Borrower

router = APIRouter()

@router.get("/today", response_model=List[Dict[str, Any]])
async def todays_reminders(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get payments due today or tomorrow
    """
    today = date.today()
    tomorrow = today + timedelta(days=1)
    user_id = current_user.id
    
    # Get payments due today or tomorrow along with loan and borrower info
    query = select(
        Payment, 
        Loan.id.label("loan_id"), 
        Borrower.name.label("borrower_name")
    ).join(
        Loan, Payment.loan_id == Loan.id
    ).join(
        Borrower, Loan.borrower_id == Borrower.id
    ).where(
        Payment.due_date.between(today, tomorrow),
        Payment.amount_paid < Payment.amount_due,
        Loan.user_id == user_id
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Format the results for the frontend
    reminders = []
    for row in rows:
        payment, loan_id, borrower_name = row
        reminders.append({
            "id": payment.id,
            "loan_id": payment.loan_id,
            "borrower_name": borrower_name,
            "type": "due_today" if payment.due_date == today else "due_tomorrow",
            "message": f"Payment of ₱{payment.amount_due - payment.amount_paid:.2f} is due today" 
                if payment.due_date == today 
                else f"Payment of ₱{payment.amount_due - payment.amount_paid:.2f} is due tomorrow",
            "amount": payment.amount_due - payment.amount_paid
        })
    
    return reminders

@router.get("/send", response_model=List[PaymentResponse])
async def trigger_reminders(
    background_tasks: BackgroundTasks,
    days: int = 7, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger reminders for upcoming payments
    This would normally connect to an SMS/notification service
    """
    upcoming = await payment_crud.get_upcoming_payments(db=db, days=days, user_id=current_user.id)
    
    # In a real system, this would send SMS/WhatsApp messages
    # Here we just simulate by adding a background task
    background_tasks.add_task(send_reminders, upcoming)
    
    return upcoming

async def send_reminders(payments):
    """
    Simulate sending reminders
    In a real system, this would integrate with Twilio or similar service
    """
    for payment in payments:
        # Just print to console for now
        print(f"[REMINDER] Payment ID {payment.id} of ₱{payment.amount_due} is due on {payment.due_date}") 