from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

from app.core.database import get_session
from app.core.auth import get_current_user, User
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse
from app.crud import loan as loan_crud
from app.schemas import ResponseModel
from app.models.payment import Payment
from app.models.loan import Loan

router = APIRouter()

class LoanCreatedResponse(BaseModel):
    id: int
    user_id: str
    borrower_id: int
    principal: float
    interest_rate_percent: float
    term_units: int
    term_frequency: str
    repayment_type: str
    interest_cycle: str
    status: str
    message: str = "Loan created successfully"

# Add status update schema
class LoanStatusUpdate(BaseModel):
    status: str

# Add class to match the response format
class LoanStatusUpdatedResponse(BaseModel):
    id: int
    user_id: str
    status: str
    message: str = "Loan status updated successfully"

@router.post("/", response_model=LoanCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan: LoanCreate, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_loan = await loan_crud.create_loan(db, loan, user_id=current_user.id)
    return LoanCreatedResponse(
        id=db_loan.id, 
        user_id=db_loan.user_id,
        borrower_id=db_loan.borrower_id,
        principal=db_loan.principal,
        interest_rate_percent=db_loan.interest_rate_percent,
        term_units=db_loan.term_units,
        term_frequency=db_loan.term_frequency,
        repayment_type=db_loan.repayment_type,
        interest_cycle=db_loan.interest_cycle,
        status=db_loan.status
    )

@router.get("/{loan_id}", response_model=Dict[str, Any])
async def read_loan(
    loan_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_loan = await loan_crud.get_loan(db, loan_id, user_id=current_user.id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found or not owned by user")
    
    return {
        "id": db_loan.id,
        "user_id": db_loan.user_id,
        "borrower_id": db_loan.borrower_id,
        "principal": db_loan.principal,
        "interest_rate_percent": db_loan.interest_rate_percent,
        "term_units": db_loan.term_units,
        "term_frequency": db_loan.term_frequency,
        "repayment_type": db_loan.repayment_type,
        "start_date": db_loan.start_date,
        "status": db_loan.status,
        "created_at": db_loan.created_at
    }

@router.get("/", response_model=List[Dict[str, Any]])
async def read_loans(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    loans = await loan_crud.get_loans(db, user_id=current_user.id, skip=skip, limit=limit)
    return [
        {
            "id": loan.id,
            "user_id": loan.user_id,
            "borrower_id": loan.borrower_id,
            "principal": loan.principal,
            "interest_rate_percent": loan.interest_rate_percent,
            "term_units": loan.term_units,
            "term_frequency": loan.term_frequency,
            "repayment_type": loan.repayment_type,
            "start_date": loan.start_date,
            "status": loan.status,
            "created_at": loan.created_at,
        }
        for loan in loans
    ]

@router.get("/borrower/{borrower_id}", response_model=List[Dict[str, Any]])
async def read_loans_by_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    loans = await loan_crud.get_loans_by_borrower(db, borrower_id, user_id=current_user.id)
    return [
        {
            "id": loan.id,
            "user_id": loan.user_id,
            "borrower_id": loan.borrower_id,
            "principal": loan.principal,
            "interest_rate_percent": loan.interest_rate_percent,
            "term_units": loan.term_units,
            "term_frequency": loan.term_frequency,
            "repayment_type": loan.repayment_type,
            "start_date": loan.start_date,
            "status": loan.status,
            "created_at": loan.created_at,
        }
        for loan in loans
    ]

@router.put("/{loan_id}", response_model=LoanResponse)
async def update_loan(
    loan_id: int, 
    loan: LoanUpdate, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_loan = await loan_crud.update_loan(db, loan_id, loan, user_id=current_user.id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found or not owned by user")
    return db_loan

@router.delete("/{loan_id}", response_model=ResponseModel)
async def delete_loan(
    loan_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await loan_crud.delete_loan(db, loan_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Loan not found or not owned by user")
    return ResponseModel(success=True, message="Loan deleted successfully")

@router.post("/{loan_id}/recalculate-schedule", response_model=ResponseModel)
async def recalculate_payment_schedule(
    loan_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_loan = await loan_crud.get_loan(db, loan_id, user_id=current_user.id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found or not owned by user")
    
    from sqlmodel import delete
    await db.execute(delete(Payment).where(Payment.loan_id == loan_id).where(Payment.user_id == current_user.id))
    
    await loan_crud.generate_schedule(db, db_loan, user_id=current_user.id)
    
    return ResponseModel(
        success=True, 
        message=f"Payment schedule for loan {loan_id} has been recalculated."
    )

@router.patch("/{loan_id}/status", response_model=LoanStatusUpdatedResponse)
async def update_loan_status(
    loan_id: int,
    status_update: LoanStatusUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_loan = await loan_crud.get_loan(db, loan_id, user_id=current_user.id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found or not owned by user")
    
    valid_statuses = ["active", "completed", "defaulted", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    db_loan.status = status_update.status
    await db.commit()
    await db.refresh(db_loan)
    
    return LoanStatusUpdatedResponse(
        id=db_loan.id,
        user_id=db_loan.user_id,
        status=db_loan.status
    )

@router.post("/{loan_id}/renew", response_model=LoanResponse)
async def renew_loan_endpoint(
    loan_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    renewed_loan_instance_from_crud = await loan_crud.renew_loan(db, loan_id, user_id=current_user.id)
    
    if renewed_loan_instance_from_crud is None:
        original_loan_check = await loan_crud.get_loan(db, loan_id, user_id=current_user.id)
        if original_loan_check is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Original loan with id {loan_id} not found or not owned by user.")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loan with id {loan_id} (status: '{original_loan_check.status}') cannot be renewed. Ensure it is 'active' or 'defaulted'."
            )
        
    stmt = (
        select(Loan)
        .options(selectinload(Loan.borrower))
        .where(Loan.id == renewed_loan_instance_from_crud.id)
        .where(Loan.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    final_renewed_loan = result.scalar_one_or_none()

    if final_renewed_loan is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve details of the renewed loan after creation, or it does not belong to the user."
        )

    return final_renewed_loan 