from sqlmodel import select, Session
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate
from typing import List, Optional
from datetime import datetime, date, timedelta

async def create_payment(db: Session, payment_data: PaymentCreate, user_id: str) -> Payment:
    db_payment = Payment(**payment_data.model_dump(), user_id=user_id)
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

async def get_payment(db: Session, payment_id: int, user_id: str) -> Optional[Payment]:
    result = await db.execute(
        select(Payment)
        .where(Payment.id == payment_id)
        .where(Payment.user_id == user_id)
    )
    return result.scalars().first()

async def get_payments(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Payment]:
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_payments_by_loan(db: Session, loan_id: int, user_id: str) -> List[Payment]:
    result = await db.execute(
        select(Payment)
        .where(Payment.loan_id == loan_id)
        .where(Payment.user_id == user_id)
    )
    return result.scalars().all()

async def update_payment(
    db: Session, 
    payment_id: int, 
    payment_data: PaymentUpdate, 
    user_id: str,
    mark_as_paid: bool = False
) -> Optional[Payment]:
    db_payment = await get_payment(db, payment_id, user_id=user_id)
    if not db_payment:
        return None
    
    update_data_dict = payment_data.model_dump(exclude_unset=True)
    if 'user_id' in update_data_dict:
        del update_data_dict['user_id']

    for key, value in update_data_dict.items():
        setattr(db_payment, key, value)

    if mark_as_paid:
        if payment_data.amount_paid is None:
             db_payment.amount_paid = db_payment.amount_due
        if payment_data.paid_at is None:
             db_payment.paid_at = datetime.utcnow()
    elif payment_data.paid_at and not db_payment.paid_at:
        db_payment.paid_at = payment_data.paid_at
    
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

async def get_upcoming_payments(db: Session, days: int = 7, user_id: str = None) -> List[Payment]:
    today = date.today()
    end_date = today + timedelta(days=days)
    
    query = select(Payment).where(
        Payment.due_date.between(today, end_date),
        Payment.amount_paid < Payment.amount_due
    )
    if user_id:
        query = query.where(Payment.user_id == user_id)
        
    result = await db.execute(query)
    return result.scalars().all()

async def get_overdue_payments(db: Session, user_id: str = None) -> List[Payment]:
    today = date.today()
    
    query = select(Payment).where(
        Payment.due_date < today,
        Payment.amount_paid < Payment.amount_due
    )
    if user_id:
        query = query.where(Payment.user_id == user_id)

    result = await db.execute(query)
    return result.scalars().all() 