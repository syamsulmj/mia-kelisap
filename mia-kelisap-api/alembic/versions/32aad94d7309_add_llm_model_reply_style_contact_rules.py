"""add llm_model reply_style contact_rules

Revision ID: 32aad94d7309
Revises: 6fb1a8ecdd13
Create Date: 2026-03-27 01:44:06.097523

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '32aad94d7309'
down_revision: Union[str, None] = '6fb1a8ecdd13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user_settings', sa.Column('llm_model', sa.String(length=50), nullable=False, server_default='gpt-4o-mini'))

    op.create_table('contact_rules',
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('contact_jid', sa.String(length=255), nullable=False, index=True),
        sa.Column('rule_type', sa.String(length=10), nullable=False),
        sa.Column('contact_name', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('user_id', 'contact_jid', name='uq_user_contact'),
    )


def downgrade() -> None:
    op.drop_table('contact_rules')
    op.drop_column('user_settings', 'llm_model')
