from use_push_app import app
from flask import render_template, request


@app.route('/')
def index():
    return render_template('index.html')


# can replace methods with method?
@app.route('/getData', methods=['POST'])
def get_data():
    obj = request.get_json()
    payload = obj['payload']

    return {
        'username': 'burst',
        'role': 'admin',
        'payload': payload
    }
