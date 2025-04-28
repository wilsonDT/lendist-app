"""add status to loans

Revision ID: add_status_to_loans
Revises: f5b7a7f52f8b
Create Date: 2023-08-01 00:00:01.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = 'add_status_to_loans'
down_revision = 'f5b7a7f52f8b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('loan', sa.Column('status', sa.String, nullable=True))
    # Set default status for existing loans to 'active'
    op.execute("UPDATE loan SET status = 'active'")
    # Make the column non-nullable after setting default values
    op.alter_column('loan', 'status', nullable=False)


def downgrade() -> None:
    op.drop_column('loan', 'status') 