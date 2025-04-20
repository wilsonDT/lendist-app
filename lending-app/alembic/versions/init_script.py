"""init

Revision ID: f5b7a7f52f8b
Revises: 
Create Date: 2023-08-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = 'f5b7a7f52f8b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "borrower",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("mobile", sa.String),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "loan",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("borrower_id", sa.Integer, sa.ForeignKey("borrower.id")),
        sa.Column("principal", sa.Numeric),
        sa.Column("interest_rate_percent", sa.Numeric),
        sa.Column("term_units", sa.Integer),
        sa.Column("term_frequency", sa.String),
        sa.Column("repayment_type", sa.String),
        sa.Column("start_date", sa.Date),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "payment",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("loan_id", sa.Integer, sa.ForeignKey("loan.id")),
        sa.Column("due_date", sa.Date),
        sa.Column("amount_due", sa.Numeric),
        sa.Column("amount_paid", sa.Numeric, default=0),
        sa.Column("paid_at", sa.DateTime),
    )


def downgrade() -> None:
    op.drop_table("payment")
    op.drop_table("loan")
    op.drop_table("borrower") 