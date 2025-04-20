from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import date, timedelta
from sqlmodel import Session, select
from app.core.database import engine
from app.models.payment import Payment

def build_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()

    @scheduler.scheduled_job("cron", hour=7, minute=0)
    async def daily_due_alerts():
        today, tomorrow = date.today(), date.today() + timedelta(days=1)
        async with Session(engine) as db:
            stmt = select(Payment).where(
                Payment.amount_paid == 0,
                Payment.due_date.between(today, tomorrow),
            )
            due = (await db.exec(stmt)).all()
            if due:
                # simplest: dump to a `reminders` table or just log
                print(f"[REMINDER] {len(due)} payments are due today/tomorrow")

    scheduler.start()
    return scheduler 