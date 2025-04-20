from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_session
from app.schemas.borrower import BorrowerCreate, BorrowerUpdate, BorrowerResponse
from app.crud import borrower as borrower_crud
from app.schemas import ResponseModel

router = APIRouter()

@router.post("/", response_model=BorrowerResponse, status_code=status.HTTP_201_CREATED)
async def create_borrower(
    borrower: BorrowerCreate, 
    db: AsyncSession = Depends(get_session)
):
    return await borrower_crud.create_borrower(db, borrower)

@router.get("/{borrower_id}", response_model=BorrowerResponse)
async def read_borrower(
    borrower_id: int, 
    db: AsyncSession = Depends(get_session)
):
    db_borrower = await borrower_crud.get_borrower(db, borrower_id)
    if db_borrower is None:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return db_borrower

@router.get("/", response_model=List[BorrowerResponse])
async def read_borrowers(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_session)
):
    borrowers = await borrower_crud.get_borrowers(db, skip=skip, limit=limit)
    return borrowers

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