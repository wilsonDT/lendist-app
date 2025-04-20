from sqlmodel import select, Session, col
from app.models.borrower import Borrower
from app.schemas.borrower import BorrowerCreate, BorrowerUpdate
from typing import List, Optional

async def create_borrower(db: Session, borrower: BorrowerCreate) -> Borrower:
    db_borrower = Borrower(**borrower.model_dump())
    db.add(db_borrower)
    await db.commit()
    await db.refresh(db_borrower)
    return db_borrower

async def get_borrower(db: Session, borrower_id: int) -> Optional[Borrower]:
    # Use explicit column selection to avoid issues with columns that might not exist
    result = await db.execute(
        select(
            Borrower.id, 
            Borrower.name, 
            Borrower.mobile, 
            Borrower.created_at
        ).where(Borrower.id == borrower_id)
    )
    return result.fetchone()

async def get_borrowers(db: Session, skip: int = 0, limit: int = 100) -> List[Borrower]:
    # Use explicit column selection to avoid issues with columns that might not exist
    result = await db.execute(
        select(
            Borrower.id, 
            Borrower.name, 
            Borrower.mobile, 
            Borrower.created_at
        ).offset(skip).limit(limit)
    )
    return result.fetchall()

async def update_borrower(db: Session, borrower_id: int, borrower: BorrowerUpdate) -> Optional[Borrower]:
    db_borrower = await get_borrower(db, borrower_id)
    if not db_borrower:
        return None
    
    borrower_data = borrower.model_dump(exclude_unset=True)
    for key, value in borrower_data.items():
        # Skip fields that don't exist in the database
        if key not in ['name', 'mobile']:
            continue
        setattr(db_borrower, key, value)
    
    await db.commit()
    await db.refresh(db_borrower)
    return db_borrower

async def delete_borrower(db: Session, borrower_id: int) -> bool:
    db_borrower = await get_borrower(db, borrower_id)
    if not db_borrower:
        return False
    
    await db.delete(db_borrower)
    await db.commit()
    return True 