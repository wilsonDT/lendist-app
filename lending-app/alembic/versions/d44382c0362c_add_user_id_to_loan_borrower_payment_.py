"""add_user_id_to_loan_borrower_payment_tables

Revision ID: d44382c0362c
Revises: add_status_to_loans
Create Date: 2025-05-15 16:24:08.370055

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = 'd44382c0362c'
down_revision = 'add_status_to_loans'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('loan', sa.Column('user_id', sa.String(), nullable=False, index=True))
    op.add_column('borrower', sa.Column('user_id', sa.String(), nullable=False, index=True))
    op.add_column('payment', sa.Column('user_id', sa.String(), nullable=False, index=True))
    pass


def downgrade() -> None:
    pass 