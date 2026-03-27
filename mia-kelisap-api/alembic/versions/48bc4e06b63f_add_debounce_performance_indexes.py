"""add debounce performance indexes

Revision ID: 48bc4e06b63f
Revises: 39cf4a7e5cf7
Create Date: 2026-03-27 11:56:55.883289

"""
from typing import Sequence, Union

from alembic import op


revision: str = '48bc4e06b63f'
down_revision: Union[str, None] = '39cf4a7e5cf7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        'ix_messages_pending_conv',
        'messages',
        ['is_pending', 'conversation_id'],
        postgresql_where='is_pending = true',
    )
    op.create_index(
        'ix_messages_conv_created',
        'messages',
        ['conversation_id', 'created_at'],
    )


def downgrade() -> None:
    op.drop_index('ix_messages_conv_created', table_name='messages')
    op.drop_index('ix_messages_pending_conv', table_name='messages')
