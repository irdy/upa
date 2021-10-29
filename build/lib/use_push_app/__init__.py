import os
from flask import Flask, render_template

app = Flask(__name__)
env_config = os.getenv('APP_SETTINGS', 'config.DevelopmentConfig')
app.config.from_object(env_config)

import use_push_app.controllers.index_controller

