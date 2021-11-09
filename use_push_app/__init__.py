import os
from flask import Flask

from database import db_session, init_db

app = Flask(__name__)
env_config = os.environ.get('APP_SETTINGS', 'config.DevelopmentConfig')
app.config.from_object(env_config)
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# DATABASE INITIALIZATION
init_db()


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


import use_push_app.controllers.index_controller
import use_push_app.controllers.users_controller
import use_push_app.controllers.contacts_controller

