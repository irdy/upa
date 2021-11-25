from jwt import PyJWTError

from database import db_session
from use_push_app import app
from flask import request, jsonify

from use_push_app.models.models import User
from use_push_app.token_manager import TokenManager
from use_push_app.utils import U, QueryUtils, Validator
from sqlalchemy.exc import SQLAlchemyError

'''
no more then 2 levels of nesting
#GET /cars/711/drivers/4 Returns driver #4 for car 711
#GET /cars?seats<=2 Returns a list of cars with a maximum of 2 seats
'''


# todo restrict (admin only)
@app.route('/api/users', methods=['POST'])
def _create_user():
    data = U.get_request_payload()
    return create_user(data)


def validate_credentials(data: dict):
    # todo more validations: string.length, email-mask? shared with client validation
    Validator.validate_required_keys(data, ["username", "password"])
    Validator.validate_unique(User, 'User', 'username', data['username'])


def create_user(data: dict):
    validate_credentials(data)

    user = User(**data)
    refresh_token = TokenManager.create_new_refresh_token(user)

    db_session.add(user)
    # commit below for creation user.id into DB
    db_session.commit()

    try:
        token_pair = TokenManager.cross_link_refresh_token(refresh_token, user)
        return TokenManager.create_response(token_pair, 201)
    except (SQLAlchemyError, PyJWTError):
        # If Token insertion fails, then delete User added earlier
        db_session.delete(user)
        db_session.commit()
        return U.make_failed_response('USER_CREATION_FAILED', 422)


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
        # todo restrict (admin only)
        return QueryUtils.delete(User, user_id, 'User')


def patch_user(user_id: int):
    body = U.get_request_payload()
    return QueryUtils.update(User, 'User', user_id, ['password'], body)
