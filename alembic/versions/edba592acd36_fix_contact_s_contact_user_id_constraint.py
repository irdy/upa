"""fix Contact's contact_user_id constraint

Revision ID: edba592acd36
Revises: 1e3b7e7fa259
Create Date: 2021-11-26 19:55:08.262043

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'edba592acd36'
down_revision = '1e3b7e7fa259'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('contacts_contact_user_id_key', 'contacts', type_='unique')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('contacts_contact_user_id_key', 'contacts', ['contact_user_id'])
    # ### end Alembic commands ###
