from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from sqlmodel import select, func

from app.core.database import get_session
from app.schemas.borrower import BorrowerCreate, BorrowerUpdate, BorrowerResponse
from app.crud import borrower as borrower_crud
from app.schemas import ResponseModel
from app.models.loan import Loan

router = APIRouter()

@router.post("/", response_model=BorrowerResponse, status_code=status.HTTP_201_CREATED)
async def create_borrower(
    borrower: BorrowerCreate, 
    db: AsyncSession = Depends(get_session)
):
    # Create a new borrower with just name and mobile fields
    return await borrower_crud.create_borrower(db, borrower)

@router.get("/{borrower_id}", response_model=Dict[str, Any])
async def read_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session)
):
    db_borrower = await borrower_crud.get_borrower(db, borrower_id)
    if db_borrower is None:
        raise HTTPException(status_code=404, detail="Borrower not found")
    
    # Get all loans for the borrower
    loans_result = await db.execute(
        select(Loan).where(Loan.borrower_id == borrower_id)
    )
    loans = loans_result.scalars().all()
    
    # Count active loans and calculate total principal
    active_loans_count = len(loans)
    total_principal = sum(loan.principal for loan in loans)
    
    # Calculate total completed loans (historical data)
    # In a real application, you would count loans with status="completed"
    # For simplicity, we're setting this equal to active_loans as a placeholder
    total_loans = active_loans_count
    
    # Convert to dict and add additional loan stats
    borrower_dict = {
        "id": db_borrower.id,
        "name": db_borrower.name,
        "mobile": db_borrower.mobile,
        "created_at": db_borrower.created_at,
        "active_loans_count": active_loans_count,
        "total_principal": total_principal,
        "total_loans": total_loans,
        "repayment_rate": 100  # Placeholder for a real calculation
    }
    
    return borrower_dict

@router.get("/", response_model=List[Dict[str, Any]])
async def read_borrowers(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session)
):
    borrowers = await borrower_crud.get_borrowers(db, skip=skip, limit=limit)
    
    # Process each borrower to get additional loan stats
    result = []
    for borrower in borrowers:
        # Get active loans count
        active_loans_count_result = await db.execute(
            select(func.count()).select_from(Loan).where(Loan.borrower_id == borrower.id)
        )
        active_loans_count = active_loans_count_result.scalar() or 0
        
        # Get total principal
        total_principal_result = await db.execute(
            select(func.sum(Loan.principal)).where(Loan.borrower_id == borrower.id)
        )
        total_principal = total_principal_result.scalar() or 0
        
        # Add to result without email and address
        result.append({
            "id": borrower.id,
            "name": borrower.name,
            "mobile": borrower.mobile,
            "created_at": borrower.created_at,
            "active_loans_count": active_loans_count,
            "total_principal": total_principal,
            "total_loans": active_loans_count,
            "repayment_rate": 100
        })
    
    return result

@router.put("/{borrower_id}", response_model=BorrowerResponse)
async def update_borrower(
    borrower_id: int, 
    borrower: BorrowerUpdate, 
    db: AsyncSession = Depends(get_session)
):
    db_borrower = await borrower_crud.update_borrower(db, borrower_id, borrower)
    if db_borrower is None:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return db_borrower

@router.delete("/{borrower_id}", response_model=ResponseModel)
async def delete_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session)
):
    result = await borrower_crud.delete_borrower(db, borrower_id)
    if not result:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return ResponseModel(success=True, message="Borrower deleted successfully") 