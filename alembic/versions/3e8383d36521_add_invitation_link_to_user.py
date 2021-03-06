"""add invitation_link to User

Revision ID: 3e8383d36521
Revises: 98c5ae7802f8
Create Date: 2021-11-26 16:35:20.128453

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3e8383d36521'
down_revision = '98c5ae7802f8'
branch_labels = None
depends_on = None


def upgrade():
    pass
    # ### commands auto generated by Alembic - please adjust! ###
    # op.add_column('invitation_links', sa.Column('link_uuid', postgresql.UUID(as_uuid=True), nullable=True))
    # op.add_column('invitation_links', sa.Column('user_id', sa.Integer(), nullable=True))
    # op.create_unique_constraint(None, 'invitation_links', ['link_uuid'])
    # op.create_foreign_key(None, 'invitation_links', 'users', ['user_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    pass
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint(None, 'invitation_links', type_='foreignkey')
    # op.drop_constraint(None, 'invitation_links', type_='unique')
    # op.drop_column('invitation_links', 'user_id')
    # op.drop_column('invitation_links', 'link_uuid')
    # ### end Alembic commands ###
