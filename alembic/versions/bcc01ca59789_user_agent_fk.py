"""user agent fk

Revision ID: bcc01ca59789
Revises: 525e346f0937
Create Date: 2021-12-26 12:36:27.296744

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bcc01ca59789'
down_revision = '525e346f0937'
branch_labels = None
depends_on = None


def upgrade():
    pass
    # ### commands auto generated by Alembic - please adjust! ###
    # op.add_column('user_agents', sa.Column('push_subscription_id', sa.Integer(), nullable=True))
    # op.create_foreign_key(None, 'user_agents', 'push_subscriptions', ['push_subscription_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    pass
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint(None, 'user_agents', type_='foreignkey')
    # op.drop_column('user_agents', 'push_subscription_id')
    # ### end Alembic commands ###
