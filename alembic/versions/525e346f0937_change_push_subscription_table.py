"""change push subscription table

Revision ID: 525e346f0937
Revises: 41414dd03c5e
Create Date: 2021-12-26 12:30:14.005631

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '525e346f0937'
down_revision = '41414dd03c5e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('push_subscriptions', sa.Column('endpoint', sa.String(length=300), nullable=False))
    op.add_column('push_subscriptions', sa.Column('expiration_time', sa.String(length=200), nullable=True))
    op.add_column('push_subscriptions', sa.Column('p256dh', sa.String(length=200), nullable=False))
    op.add_column('push_subscriptions', sa.Column('auth', sa.String(length=100), nullable=False))
    op.drop_constraint('push_subscriptions_sub_endpoint_key', 'push_subscriptions', type_='unique')
    op.create_unique_constraint(None, 'push_subscriptions', ['endpoint'])
    op.drop_column('push_subscriptions', 'sub_endpoint')
    op.drop_column('push_subscriptions', 'user_agent')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('push_subscriptions', sa.Column('user_agent', sa.VARCHAR(length=200), autoincrement=False, nullable=True))
    op.add_column('push_subscriptions', sa.Column('sub_endpoint', sa.VARCHAR(length=200), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'push_subscriptions', type_='unique')
    op.create_unique_constraint('push_subscriptions_sub_endpoint_key', 'push_subscriptions', ['sub_endpoint'])
    op.drop_column('push_subscriptions', 'auth')
    op.drop_column('push_subscriptions', 'p256dh')
    op.drop_column('push_subscriptions', 'expiration_time')
    op.drop_column('push_subscriptions', 'endpoint')
    # ### end Alembic commands ###
