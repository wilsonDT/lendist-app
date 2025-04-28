from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, delete
from app.core.database import get_session
from app.routers import loan, borrower, payment, dashboard, reminders
from app.core.scheduler import build_scheduler

app = FastAPI(title="Lending‑MVP")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server URL
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",  # Vite default port alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(borrower.router, prefix="/borrowers", tags=["Borrowers"])
app.include_router(loan.router, prefix="/loans", tags=["Loans"])
app.include_router(payment.router, prefix="/payments", tags=["Payments"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])

# Initialize models
from app.models import borrower, loan, payment
from sqlmodel import SQLModel
from app.core.database import engine

@app.on_event("startup")
async def on_startup():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    # Start scheduler
    build_scheduler()

# Add a startup event to recalculate payment schedules if needed
@app.on_event("startup")
async def recalculate_payment_schedules():
    from app.models.loan import Loan
    from app.models.payment import Payment
    from app.crud.loan import generate_schedule
    import logging
    import os
    
    # Only recalculate if a specific environment variable is set
    if os.environ.get("RECALCULATE_PAYMENTS", "0") != "1":
        logging.info("Payment recalculation skipped. Set RECALCULATE_PAYMENTS=1 to enable.")
        return
        
    logging.info("Starting payment schedule recalculation...")
    
    async with engine.begin() as conn:
        # Get all loans
        result = await conn.execute(select(Loan))
        loans = result.scalars().all()
        
        if not loans:
            logging.info("No loans found. Nothing to recalculate.")
            return
            
        logging.info(f"Found {len(loans)} loans. Recalculating payment schedules...")
        
        # For each loan, regenerate its payment schedule
        async with get_session() as session:
            for loan in loans:
                try:
                    # Delete existing payments
                    await session.execute(delete(Payment).where(Payment.loan_id == loan.id))
                    
                    # Generate new schedule
                    await generate_schedule(session, loan)
                    
                    logging.info(f"Recalculated payment schedule for loan {loan.id}")
                except Exception as e:
                    logging.error(f"Error recalculating payments for loan {loan.id}: {e}")
        
        logging.info("Payment schedule recalculation completed.")

@app.get("/")
async def root():
    return {"message": "Welcome to Lending MVP API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 