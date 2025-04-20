from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_session
from app.schemas.payment import PaymentResponse
from app.crud import payment as payment_crud

router = APIRouter()

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