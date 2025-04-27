from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from sqlmodel import select, desc

from app.core.database import get_session
from app.schemas.payment import PaymentResponse, PaymentUpdate
from app.crud import payment as payment_crud
from app.models.payment import Payment
from app.models.loan import Loan
from app.models.borrower import Borrower
from app.crud.loan import generate_schedule  # Import the payment calculation logic

router = APIRouter()

# Helper function to calculate the correct payment amount based on loan details
async def calculate_payment_amount(db: AsyncSession, loan_id: int) -> float:
    """
    Calculate the correct payment amount considering the loan's interest_cycle.
    Returns the payment amount per period.
    """
    # Get the loan details
    loan_query = select(Loan).where(Loan.id == loan_id)
    result = await db.execute(loan_query)
    loan = result.scalars().first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Check if this is a one-time interest loan
    is_one_time_interest = loan.interest_cycle and loan.interest_cycle.lower() == "one-time"
    
    # If it's one-time interest and there's only one term, handle specially
    if is_one_time_interest and loan.term_units == 1:
        # For one payment term with one-time interest, apply full interest
        full_interest = (loan.principal * loan.interest_rate_percent) / 100
        return round(loan.principal + full_interest, 2)
    
    # Calculate annual interest rate based on interest cycle
    annual_rate = loan.interest_rate_percent
    interest_cycle = loan.interest_cycle.lower() if loan.interest_cycle else "yearly"
    
    if is_one_time_interest:
        # For one-time interest with multiple payments, distribute evenly
        # We'll just use the direct rate divided by term units
        periodic_rate = loan.interest_rate_percent / loan.term_units
    else:
        # For recurring interest types, calculate the annualized rate
        if interest_cycle == "daily":
            annual_rate = loan.interest_rate_percent * 365
        elif interest_cycle == "weekly":
            annual_rate = loan.interest_rate_percent * 52
        elif interest_cycle == "monthly":
            annual_rate = loan.interest_rate_percent * 12
        
        # Calculate periodic rate based on payment frequency
        periodic_rate = annual_rate
        term_frequency = loan.term_frequency.lower()
        if term_frequency == "daily":
            periodic_rate = annual_rate / 365
        elif term_frequency == "weekly":
            periodic_rate = annual_rate / 52
        elif term_frequency == "monthly":
            periodic_rate = annual_rate / 12
        elif term_frequency == "quarterly":
            periodic_rate = annual_rate / 4
    
    # Calculate payment amount based on repayment type
    if loan.repayment_type.lower() == "flat":
        # Flat loans: interest calculated on full principal
        if is_one_time_interest:
            # For one-time interest with multiple payments (flat), distribute evenly
            interest_per_period = (loan.principal * loan.interest_rate_percent) / 100 / loan.term_units
        else:
            # Standard flat interest calculation
            interest_per_period = (loan.principal * periodic_rate) / 100
            
        principal_per_period = loan.principal / loan.term_units
        return round(principal_per_period + interest_per_period, 2)
    else:  # Amortized loans
        if is_one_time_interest:
            # For one-time interest with amortized repayment, calculate total amount and divide
            total_interest = (loan.principal * loan.interest_rate_percent) / 100
            total_amount = loan.principal + total_interest
            return round(total_amount / loan.term_units, 2)
        else:
            # Standard amortization calculation for recurring interest
            # Convert periodic rate to decimal
            rate = periodic_rate / 100
            # Calculate payment using amortization formula
            payment = loan.principal * rate / (1 - (1 + rate) ** (-loan.term_units))
            return round(payment, 2)

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

class RecentPaymentResponse(BaseModel):
    id: int
    loan_id: int
    borrower_id: int
    borrower_name: str
    amount_paid: float
    payment_date: datetime
    payment_method: str = "cash"

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

@router.get("/recent/", response_model=List[RecentPaymentResponse])
async def get_recent_payments(
    limit: int = 10,
    db: AsyncSession = Depends(get_session)
):
    # Get payments that have been paid (paid_at is not null)
    query = (
        select(Payment, Loan, Borrower)
        .join(Loan, Payment.loan_id == Loan.id)
        .join(Borrower, Loan.borrower_id == Borrower.id)
        .where(Payment.paid_at.is_not(None))
        .order_by(desc(Payment.paid_at))
        .limit(limit)
    )
    
    result = await db.execute(query)
    recent_payments = []
    
    for payment, loan, borrower in result:
        recent_payments.append(
            RecentPaymentResponse(
                id=payment.id,
                loan_id=payment.loan_id,
                borrower_id=borrower.id,
                borrower_name=borrower.name,
                amount_paid=payment.amount_paid,
                payment_date=payment.paid_at,
                payment_method="cash"  # Default to cash as payment method isn't stored
            )
        )
    
    return recent_payments

@router.get("/loan/{loan_id}", response_model=List[Dict[str, Any]])
async def read_payments_by_loan(
    loan_id: int, 
    recalculate: bool = False,
    db: AsyncSession = Depends(get_session)
):
    payments = await payment_crud.get_payments_by_loan(db, loan_id)
    
    # If recalculate is True, get the correct payment amount based on interest_cycle
    correct_amount = None
    if recalculate:
        try:
            correct_amount = await calculate_payment_amount(db, loan_id)
        except Exception as e:
            # Log the error but continue with stored amounts
            print(f"Error calculating payment amount: {e}")
    
    result = []
    for payment in payments:
        # Use recalculated amount if available
        amount_due = correct_amount if correct_amount is not None else payment.amount_due
        
        result.append({
            "id": payment.id,
            "loan_id": payment.loan_id,
            "due_date": str(payment.due_date),
            "amount_due": amount_due,
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

@router.post("/", response_model=PaymentCollected)
async def create_payment(
    payment_data: Dict[str, Any],
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new payment record.
    This endpoint can be used for additional payments or manual corrections.
    """
    loan_id = payment_data.get("loan_id")
    if not loan_id:
        raise HTTPException(status_code=400, detail="Loan ID is required")
    
    # Get the loan to verify it exists
    loan_query = select(Loan).where(Loan.id == loan_id)
    result = await db.execute(loan_query)
    loan = result.scalars().first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Create new Payment object
    new_payment = Payment(
        loan_id=loan_id,
        due_date=payment_data.get("due_date", datetime.now().date()),
        amount_due=payment_data.get("amount", 0),
        amount_paid=payment_data.get("amount", 0),
        paid_at=payment_data.get("date", datetime.now())
    )
    
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)
    
    return PaymentCollected(
        id=new_payment.id,
        loan_id=new_payment.loan_id,
        amount_due=new_payment.amount_due,
        amount_paid=new_payment.amount_paid,
        paid_at=new_payment.paid_at
    )

@router.post("/loan/{loan_id}/recalculate", response_model=Dict[str, Any])
async def recalculate_loan_payments(
    loan_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Recalculate all payment schedules for a loan based on its interest_cycle.
    """
    # Get the loan
    loan_query = select(Loan).where(Loan.id == loan_id)
    result = await db.execute(loan_query)
    loan = result.scalars().first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    try:
        # Delete existing payments
        from sqlmodel import delete
        await db.execute(delete(Payment).where(Payment.loan_id == loan_id))
        
        # Generate new payment schedule
        await generate_schedule(db, loan)
        
        # Get the updated payments
        updated_payments = await payment_crud.get_payments_by_loan(db, loan_id)
        
        return {
            "success": True,
            "message": f"Recalculated {len(updated_payments)} payments for loan {loan_id}",
            "loan_id": loan_id,
            "payment_count": len(updated_payments)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error recalculating payments: {str(e)}"
        ) 