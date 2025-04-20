from sqlmodel import select, Session
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
    result = await db.execute(select(Borrower).where(Borrower.id == borrower_id))
    return result.scalars().first()

async def get_borrowers(db: Session, skip: int = 0, limit: int = 100) -> List[Borrower]:
    result = await db.execute(select(Borrower).offset(skip).limit(limit))
    return result.scalars().all()

async def update_borrower(db: Session, borrower_id: int, borrower: BorrowerUpdate) -> Optional[Borrower]:
    db_borrower = await get_borrower(db, borrower_id)
    if not db_borrower:
        return None
    
    borrower_data = borrower.model_dump(exclude_unset=True)
    for key, value in borrower_data.items():
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