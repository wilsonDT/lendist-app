from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from sqlmodel import select, func

from app.core.database import get_session
from app.core.auth import get_current_user, User
from app.schemas.borrower import BorrowerCreate, BorrowerUpdate, BorrowerResponse
from app.crud import borrower as borrower_crud
from app.schemas import ResponseModel
from app.models.loan import Loan
from app.models.borrower import Borrower

router = APIRouter()

@router.post("/", response_model=BorrowerResponse, status_code=status.HTTP_201_CREATED)
async def create_borrower(
    borrower: BorrowerCreate, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await borrower_crud.create_borrower(db, borrower, user_id=current_user.id)

@router.get("/{borrower_id}", response_model=Dict[str, Any])
async def read_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_borrower = await borrower_crud.get_borrower(db, borrower_id, user_id=current_user.id)
    if db_borrower is None:
        raise HTTPException(status_code=404, detail="Borrower not found or not owned by user")
    
    # Get all loans for the borrower, ensuring they also belong to the current user
    loans_result = await db.execute(
        select(Loan).where(Loan.borrower_id == borrower_id).where(Loan.user_id == current_user.id)
    )
    loans = loans_result.scalars().all()
    
    active_loans_count = len(loans)
    total_principal = sum(loan.principal for loan in loans)
    total_loans = active_loans_count
    
    borrower_dict = {
        "id": db_borrower.id,
        "user_id": db_borrower.user_id,
        "name": db_borrower.name,
        "mobile": db_borrower.mobile,
        "created_at": db_borrower.created_at,
        "active_loans_count": active_loans_count,
        "total_principal": total_principal,
        "total_loans": total_loans,
        "repayment_rate": 100
    }
    
    return borrower_dict

@router.get("/", response_model=List[Dict[str, Any]])
async def read_borrowers(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    borrowers = await borrower_crud.get_borrowers(db, user_id=current_user.id, skip=skip, limit=limit)
    
    result = []
    for borrower_obj in borrowers:
        # Get active loans count for this borrower, ensuring loans belong to current user
        active_loans_count_result = await db.execute(
            select(func.count(Loan.id)).select_from(Loan)
            .where(Loan.borrower_id == borrower_obj.id)
            .where(Loan.user_id == current_user.id)
        )
        active_loans_count = active_loans_count_result.scalar_one_or_none() or 0
        
        # Get total principal for this borrower, ensuring loans belong to current user
        total_principal_result = await db.execute(
            select(func.sum(Loan.principal)).select_from(Loan)
            .where(Loan.borrower_id == borrower_obj.id)
            .where(Loan.user_id == current_user.id)
        )
        total_principal = total_principal_result.scalar_one_or_none() or 0.0
        
        result.append({
            "id": borrower_obj.id,
            "user_id": borrower_obj.user_id,
            "name": borrower_obj.name,
            "mobile": borrower_obj.mobile,
            "created_at": borrower_obj.created_at,
            "active_loans_count": active_loans_count,
            "total_principal": total_principal,
            "total_loans": active_loans_count,
            "repayment_rate": 100
        })
    
    return result

@router.put("/{borrower_id}", response_model=BorrowerResponse)
async def update_borrower(
    borrower_id: int, 
    borrower_update_data: BorrowerUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_borrower = await borrower_crud.update_borrower(db, borrower_id, borrower_update_data, user_id=current_user.id)
    if db_borrower is None:
        raise HTTPException(status_code=404, detail="Borrower not found or not owned by user")
    return db_borrower

@router.delete("/{borrower_id}", response_model=ResponseModel)
async def delete_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await borrower_crud.delete_borrower(db, borrower_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Borrower not found or not owned by user, or deletion criteria not met (e.g., active loans exist)")
    return ResponseModel(success=True, message="Borrower deleted successfully") 