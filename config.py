import os
from database import database_url

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    DEBUG: False
    TESTING = False
    CSRF_ENABLED = True
    # SECRET_KEY: os.getenv("SECRET_KEY", "this-is-the-default-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', database_url)


class ProductionConfig:
    DEBUG = False


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig:
    DEBUG: True
    DEVELOPMENT: True


class TestingConfig(Config):
    TESTING = True
