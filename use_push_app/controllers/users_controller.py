from database import db_session
from use_push_app import app
from flask import request, jsonify
from use_push_app.models.models import User
from use_push_app.utils import U, QueryUtils, Validator

'''
no more then 2 levels of nesting
#GET /cars/711/drivers/4 Returns driver #4 for car 711
#GET /cars?seats<=2 Returns a list of cars with a maximum of 2 seats
'''


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.form.to_dict()

    error_response = Validator.validate_required_keys(data, ["username", "password"])
    if error_response is not None:
        return error_response

    error_response = Validator.validate_unique(User, 'User', 'username', data['username'])
    if error_response is not None:
        return error_response

    user = User(**data)

    db_session.add(user)
    db_session.commit()

    return QueryUtils.make_success_response("CREATED", 'User', user)


@app.route('/api/users')
def get_users():
    users = User.query.all()
    resp_body_dict = U.make_resp_json_body(U.success, dict(users=[user.to_dict() for user in users]))
    return jsonify(resp_body_dict)


@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    return QueryUtils.read(User, user_id, 'User')


@app.route('/api/users/<int:user_id>', methods=['DELETE', 'PATCH'])
def update_delete_user(user_id):
    if request.method == 'PATCH':
        return patch_user(user_id)
    elif request.method == 'DELETE':
        return QueryUtils.delete(User, user_id, 'User')


def patch_user(user_id: int):
    # validate Request Content-Type
    body = U.extract_request_body(request)
    if body is None:
        return U.make_incorrect_request_content_type_resp()

    return QueryUtils.update(User, 'User', user_id, ['password'], body)

