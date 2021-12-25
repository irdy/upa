import logging
import os
from flask import Flask
from flask_cors import CORS

from database import db_session, init_db
from use_push_app.auth_middleware import AuthMiddleware


app = Flask(__name__, static_folder="./client/use-push-app/build", static_url_path='')
debug = os.environ.get("DEBUG", False)

if debug:
    logging.getLogger('flask_cors').level = logging.DEBUG
    print("App runs in debug mode. CORS Enabled")
    CORS(app, resources={
        r"/api/*": {"origins": "http://localhost:3000"},
    }, supports_credentials=True)
else:
    print("App runs in production mode. CORS Disabled")

env_config = os.environ.get('APP_SETTINGS', 'config.DevelopmentConfig')
app.config.from_object(env_config)

# calling our middleware
app.wsgi_app = AuthMiddleware(app.wsgi_app)

# DATABASE INITIALIZATION
init_db()


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


import use_push_app.json_encoder_uuid_patch
import use_push_app.controllers.users_controller
import use_push_app.controllers.contacts_controller
import use_push_app.controllers.auth_controller

