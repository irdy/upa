import uuid
from flask import make_response, jsonify, send_from_directory
from database import db_session
from use_push_app import app
from use_push_app.controllers.users_controller import create_user
from use_push_app.models.models import User, RefreshToken, InvitationLink, Contact
from use_push_app.token_manager import TokenManager
from use_push_app.utils import U, Validator
from use_push_app.auth_middleware import enable_cors

# HOME
@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/api/auth/sign_in', methods=['POST'])
def auth_sign_in():
    # todo sign_in attempt 20?
    data = U.get_request_payload()
    Validator.validate_required_keys(data, ["username", "password"])

    username = data["username"]
    password = data["password"]

    # check user is not exists
    user = Validator.validate_no_exists(User, "User", "username", username)

    # verify password
    if not user.verify_password(password):
        resp_json_body = U.make_resp_json_body(U.fail, None, "Password is incorrect")
        return make_response(jsonify(resp_json_body), 401)

    # handle refresh_token
    refresh_token_query: RefreshToken = TokenManager.get_refresh_token_query(user)
    token_pair = TokenManager.cross_link_refresh_token(refresh_token_query, user)
    return TokenManager.create_response(token_pair, 200)


@app.route('/api/auth/sign_up', methods=['POST'])
def auth_sign_up():
    # SIGN_UP accessible only with `Invitation link` (generated with method below)
    data = U.get_request_payload()
    Validator.validate_required_keys(data, ["link_uuid"])
    link_uuid = Validator.is_valid_uuid(data["link_uuid"])
    # Invitation link will be deleted after user will be created (inside create user method)
    return create_user(data=data, link_uuid=link_uuid)


@app.route('/api/auth/invitation_link', methods=['POST'])
def auth_generate_invitation_link():
    user_id = TokenManager.get_user_id()
    invitation_link = InvitationLink(user_id)
    db_session.add(invitation_link)
    db_session.commit()
    resp_body_dict = U.make_resp_json_body(U.success, dict(link_uuid=invitation_link.link_uuid))
    return make_response(resp_body_dict)


@app.route('/api/auth/sign_out', methods=['POST'])
def auth_sign_out():
    refresh_token = TokenManager.get_refresh_token_from_request()
    if refresh_token is None:
        return U.make_failed_response("REFRESH_TOKEN_DOES_NOT_EXIST", 401)

    refresh_token_query = TokenManager.find_token_query_with_same_token_family(refresh_token)
    refresh_token_query.token = None

    db_session.commit()
    return jsonify(U.make_resp_json_body(U.success))


@app.route('/api/auth/refresh_tokens', methods=["POST"])
def refresh_tokens():
    refresh_token = TokenManager.get_refresh_token_from_request()
    if refresh_token is None:
        return U.make_failed_response("REFRESH_TOKEN_DOES_NOT_EXIST", 401)

    refresh_token_query = TokenManager.find_token_query_with_same_token_family(refresh_token)

    if not refresh_token_query.token:
        return U.make_failed_response("USER_IS_LOGGED_OUT", 401)

    # compare tokens, both token verified inside - try: jwt.decode, except: 401
    if TokenManager.tokens_are_not_matched(refresh_token, refresh_token_query.token):
        db_session.delete(refresh_token_query)
        db_session.commit()
        return U.make_failed_response("TOKENS_ARE_NOT_MATCHED", 401)

    user = User.query.filter(User.id == refresh_token_query.user_id).one_or_none()
    if user is None:
        # User must exist! coz refresh_token can't exist without associated user (db relation)
        return U.make_error_response("TOKEN_IS_NOT_BIND_TO_USER")

    token_pair = TokenManager.cross_link_refresh_token(refresh_token_query, user)
    return TokenManager.create_response(token_pair, 200)

