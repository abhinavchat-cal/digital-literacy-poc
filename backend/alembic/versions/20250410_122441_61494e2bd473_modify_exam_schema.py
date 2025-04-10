"""Modify exam schema

Revision ID: 61494e2bd473
Revises: a0f9a7719917
Create Date: 2025-04-10 12:24:41.209038+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '61494e2bd473'
down_revision: Union[str, None] = 'a0f9a7719917'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('exams', 'subject_id',
               existing_type=sa.UUID(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('exams', 'subject_id',
               existing_type=sa.UUID(),
               nullable=True)
    # ### end Alembic commands ### 