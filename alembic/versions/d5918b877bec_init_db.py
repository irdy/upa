"""init db

Revision ID: d5918b877bec
Revises: 
Create Date: 2021-11-08 18:15:52.921150

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5918b877bec'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('push_subscriptions', sa.Column('user_agent', sa.String(length=200), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('push_subscriptions', 'user_agent')
    # ### end Alembic commands ###
