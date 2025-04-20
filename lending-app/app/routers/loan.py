from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

from app.core.database import get_session
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse
from app.crud import loan as loan_crud
from app.schemas import ResponseModel

router = APIRouter()

class LoanCreatedResponse(BaseModel):
    id: int
    borrower_id: int
    principal: float
    interest_rate_percent: float
    term_units: int
    term_frequency: str
    repayment_type: str
    message: str = "Loan created successfully"

@router.post("/", response_model=LoanCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan: LoanCreate, 
    db: AsyncSession = Depends(get_session)
):
    db_loan = await loan_crud.create_loan(db, loan)
    return LoanCreatedResponse(
        id=db_loan.id, 
        borrower_id=db_loan.borrower_id,
        principal=db_loan.principal,
        interest_rate_percent=db_loan.interest_rate_percent,
        term_units=db_loan.term_units,
        term_frequency=db_loan.term_frequency,
        repayment_type=db_loan.repayment_type
    )

@router.get("/{loan_id}", response_model=Dict[str, Any])
async def read_loan(
    loan_id: int, 
    db: AsyncSession = Depends(get_session)
):
    db_loan = await loan_crud.get_loan(db, loan_id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Convert to dict to avoid relationship loading issues
    return {
        "id": db_loan.id,
        "borrower_id": db_loan.borrower_id,
        "principal": db_loan.principal,
        "interest_rate_percent": db_loan.interest_rate_percent,
        "term_units": db_loan.term_units,
        "term_frequency": db_loan.term_frequency,
        "repayment_type": db_loan.repayment_type,
        "start_date": db_loan.start_date,
        "created_at": db_loan.created_at
    }

@router.get("/", response_model=List[LoanResponse])
async def read_loans(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session)
):
    loans = await loan_crud.get_loans(db, skip=skip, limit=limit)
    return loans

@router.get("/borrower/{borrower_id}", response_model=List[LoanResponse])
async def read_loans_by_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session)
):
    loans = await loan_crud.get_loans_by_borrower(db, borrower_id)
    return loans

@router.put("/{loan_id}", response_model=LoanResponse)
async def update_loan(
    loan_id: int, 
    loan: LoanUpdate, 
    db: AsyncSession = Depends(get_session)
):
    db_loan = await loan_crud.update_loan(db, loan_id, loan)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found")
    return db_loan

@router.delete("/{loan_id}", response_model=ResponseModel)
async def delete_loan(
    loan_id: int, 
    db: AsyncSession = Depends(get_session)
):
    result = await loan_crud.delete_loan(db, loan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Loan not found")
    return ResponseModel(success=True, message="Loan deleted successfully") 