import os
from database import database_url

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    DEBUG: False
    TESTING = False
    CSRF_ENABLED = True
    SQLALCHEMY_DATABASE_URI = database_url


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

