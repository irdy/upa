import os


class Config:
    DEBUG: False
    DEVELOPMENT: False
    # SECRET_KEY: os.getenv("SECRET_KEY", "this-is-the-default-key")


class ProductionConfig:
    pass


class DevelopmentConfig:
    DEBUG: True
    DEVELOPMENT: True

