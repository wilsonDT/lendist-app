from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import borrower, loan, payment, dashboard, reminders
from app.core.scheduler import build_scheduler

app = FastAPI(title="Lending‑MVP")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server URL
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

@app.get("/")
async def root():
    return {"message": "Welcome to Lending MVP API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 