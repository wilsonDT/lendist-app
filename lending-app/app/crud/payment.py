from sqlmodel import select, Session
from app.models.payment import Payment
from app.schemas.payment import PaymentUpdate
from typing import List, Optional
from datetime import datetime

async def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    return result.scalars().first()

async def get_payments(db: Session, skip: int = 0, limit: int = 100) -> List[Payment]:
    result = await db.execute(select(Payment).offset(skip).limit(limit))
    return result.scalars().all()

async def get_payments_by_loan(db: Session, loan_id: int) -> List[Payment]:
    result = await db.execute(select(Payment).where(Payment.loan_id == loan_id))
    return result.scalars().all()

async def update_payment(db: Session, payment_id: int, payment: PaymentUpdate) -> Optional[Payment]:
    db_payment = await get_payment(db, payment_id)
    if not db_payment:
        return None
    
    db_payment.amount_paid = payment.amount_paid
    db_payment.paid_at = payment.paid_at or datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

async def get_upcoming_payments(db: Session, days: int = 7) -> List[Payment]:
    from datetime import date, timedelta
    today = date.today()
    end_date = today + timedelta(days=days)
    
    result = await db.execute(
        select(Payment).where(
            Payment.due_date.between(today, end_date),
            Payment.amount_paid < Payment.amount_due
        )
    )
    return result.scalars().all()

async def get_overdue_payments(db: Session) -> List[Payment]:
    from datetime import date
    today = date.today()
    
    result = await db.execute(
        select(Payment).where(
            Payment.due_date < today,
            Payment.amount_paid < Payment.amount_due
        )
    )
    return result.scalars().all() 