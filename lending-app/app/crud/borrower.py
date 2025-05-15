from sqlmodel import select, Session, col
from app.models.borrower import Borrower
from app.schemas.borrower import BorrowerCreate, BorrowerUpdate
from typing import List, Optional

async def create_borrower(db: Session, borrower_data: BorrowerCreate, user_id: str) -> Borrower:
    db_borrower = Borrower(
        **borrower_data.model_dump(),
        user_id=user_id
    )
    db.add(db_borrower)
    await db.commit()
    await db.refresh(db_borrower)
    return db_borrower

async def get_borrower(db: Session, borrower_id: int, user_id: str) -> Optional[Borrower]:
    result = await db.execute(
        select(Borrower)
        .where(Borrower.id == borrower_id)
        .where(Borrower.user_id == user_id)
    )
    return result.scalars().first()

async def get_borrowers(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Borrower]:
    result = await db.execute(
        select(Borrower)
        .where(Borrower.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_borrower(db: Session, borrower_id: int, borrower_update_data: BorrowerUpdate, user_id: str) -> Optional[Borrower]:
    db_borrower = await get_borrower(db, borrower_id, user_id=user_id)
    if not db_borrower:
        return None
    
    update_data = borrower_update_data.model_dump(exclude_unset=True)
    if 'user_id' in update_data:
        del update_data['user_id']
        
    for key, value in update_data.items():
        setattr(db_borrower, key, value)
    
    await db.commit()
    await db.refresh(db_borrower)
    return db_borrower

async def delete_borrower(db: Session, borrower_id: int, user_id: str) -> bool:
    db_borrower = await get_borrower(db, borrower_id, user_id=user_id)
    if not db_borrower:
        return False
    
    await db.delete(db_borrower)
    await db.commit()
    return True 