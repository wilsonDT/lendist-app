from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_session
from app.schemas.payment import PaymentResponse, PaymentUpdate
from app.crud import payment as payment_crud

router = APIRouter()

class PaymentSimpleResponse(BaseModel):
    id: int
    loan_id: int
    due_date: str
    amount_due: float
    amount_paid: float
    paid_at: datetime = None

class PaymentCollected(BaseModel):
    id: int
    loan_id: int
    amount_due: float
    amount_paid: float
    paid_at: datetime
    message: str = "Payment collected successfully"

@router.get("/{payment_id}", response_model=PaymentResponse)
async def read_payment(
    payment_id: int, 
    db: AsyncSession = Depends(get_session)
):
    db_payment = await payment_crud.get_payment(db, payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.get("/", response_model=List[PaymentResponse])
async def read_payments(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session)
):
    payments = await payment_crud.get_payments(db, skip=skip, limit=limit)
    return payments

@router.get("/loan/{loan_id}", response_model=List[Dict[str, Any]])
async def read_payments_by_loan(
    loan_id: int, 
    db: AsyncSession = Depends(get_session)
):
    payments = await payment_crud.get_payments_by_loan(db, loan_id)
    result = []
    for payment in payments:
        result.append({
            "id": payment.id,
            "loan_id": payment.loan_id,
            "due_date": str(payment.due_date),
            "amount_due": payment.amount_due,
            "amount_paid": payment.amount_paid,
            "paid_at": payment.paid_at
        })
    return result

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int, 
    payment: PaymentUpdate, 
    db: AsyncSession = Depends(get_session)
):
    db_payment = await payment_crud.update_payment(db, payment_id, payment)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.get("/upcoming/", response_model=List[PaymentResponse])
async def read_upcoming_payments(
    days: int = 7, 
    db: AsyncSession = Depends(get_session)
):
    payments = await payment_crud.get_upcoming_payments(db, days)
    return payments

@router.get("/overdue/", response_model=List[PaymentResponse])
async def read_overdue_payments(
    db: AsyncSession = Depends(get_session)
):
    payments = await payment_crud.get_overdue_payments(db)
    return payments

@router.post("/{payment_id}/collect", response_model=PaymentCollected)
async def collect_payment(
    payment_id: int,
    payment: PaymentUpdate,
    db: AsyncSession = Depends(get_session)
):
    db_payment = await payment_crud.update_payment(db, payment_id, payment)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return PaymentCollected(
        id=db_payment.id,
        loan_id=db_payment.loan_id,
        amount_due=db_payment.amount_due,
        amount_paid=db_payment.amount_paid,
        paid_at=db_payment.paid_at
    ) 