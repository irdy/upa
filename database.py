import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base


# def get_locale_database_url():
#     from private_config import DATABASE_LOGIN, DATABASE_PASS
#     locale_database_url = f'postgresql://{DATABASE_LOGIN}:{DATABASE_PASS}@localhost:5432/use_push_dev'
#     return locale_database_url


# database_url = os.environ.get('DATABASE_URL', get_locale_database_url())
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(database_url)

db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()


def load_models():
    import use_push_app.models.models


def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    load_models()
    Base.metadata.create_all(bind=engine)
    return Base.metadata

