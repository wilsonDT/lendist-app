from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from datetime import date, timedelta
from sqlmodel import select

from app.core.database import get_session
from app.schemas.payment import PaymentResponse
from app.crud import payment as payment_crud
from app.models.payment import Payment

router = APIRouter()

@router.get("/today", response_model=List[Dict[str, Any]])
async def todays_reminders(
    db: AsyncSession = Depends(get_session)
):
    """
    Get payments due today or tomorrow
    """
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    # Get payments due today or tomorrow
    result = await db.execute(
        select(Payment)
        .where(
            Payment.due_date.between(today, tomorrow),
            Payment.amount_paid < Payment.amount_due
        )
    )
    payments = result.scalars().all()
    
    # Convert to dict to avoid relationship loading issues
    return [
        {
            "id": payment.id,
            "loan_id": payment.loan_id,
            "due_date": str(payment.due_date),
            "amount_due": payment.amount_due,
            "amount_paid": payment.amount_paid,
            "status": "due_today" if payment.due_date == today else "due_tomorrow"
        }
        for payment in payments
    ]

@router.get("/send", response_model=List[PaymentResponse])
async def trigger_reminders(
    background_tasks: BackgroundTasks,
    days: int = 7, 
    db: AsyncSession = Depends(get_session)
):
    """
    Manually trigger reminders for upcoming payments
    This would normally connect to an SMS/notification service
    """
    upcoming = await payment_crud.get_upcoming_payments(db, days)
    
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
        print(f"[REMINDER] Payment ID {payment.id} of ${payment.amount_due} is due on {payment.due_date}") 