"""change password for password_hash

Revision ID: 87c56464f8a8
Revises: d8fc9a1845c5
Create Date: 2021-11-18 16:17:54.506340

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '87c56464f8a8'
down_revision = 'd8fc9a1845c5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'password', nullable=False, new_column_name='password_hash')
    op.create_foreign_key(None, 'contacts', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'refresh_tokens', 'users', ['user_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'password_hash', nullable=False, new_column_name='password')
    op.drop_constraint(None, 'refresh_tokens', type_='foreignkey')
    op.drop_constraint(None, 'contacts', type_='foreignkey')
    # ### end Alembic commands ###
