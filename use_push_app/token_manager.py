import os
from datetime import datetime, timezone, timedelta
from uuid import UUID
import jwt
from flask import request, make_response, jsonify, abort
from jwt import PyJWTError

from database import db_session
from use_push_app.messages import messages
from use_push_app.exceptions import InvalidTokenException
from use_push_app.models.models import RefreshToken, User
from use_push_app.utils import U

JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALG = "HS256"
REFRESH_TOKEN_LIFE_TIME = 180 # days


class TokenManager:
    @staticmethod
    def extract_uuid_from_req_header():
        if 'X-UUID' not in request.headers:
            response = U.make_failed_response('NO_X-UUID_HEADER', 400)
            abort(response)

        device_uuid = request.headers.get('X-UUID')
        return device_uuid

    @staticmethod
    def parse_bearer_token(bearer_token: str) -> str:
        bearer_token_parts = bearer_token.split(" ")
        if bearer_token_parts[0] != "Bearer" or not bearer_token_parts[1]:
            raise InvalidTokenException

        token = bearer_token_parts[1]
        return token

    @staticmethod
    def extract_bearer_token_from_req_header():
        if 'Authorization' not in request.headers:
            return abort(U.make_failed_response('NO_AUTHORIZATION_HEADER', 401))

        bearer_token = request.headers.get('Authorization')  # access_token or refresh_token
        try:
            token = TokenManager.parse_bearer_token(bearer_token)
        except InvalidTokenException:
            return abort(U.make_failed_response('INVALID_TOKEN', 401))

        return token

    @staticmethod
    def get_user_id() -> str:
        access_token = TokenManager.extract_bearer_token_from_req_header()
        user_id = TokenManager.get_data_from_token_body(access_token, "user_id")
        if not user_id:
            return abort(U.make_failed_response('NO_USER_ID_INTO_ACCESS_TOKEN', 500))

        return user_id

    @staticmethod
    def is_browser() -> bool:
        device_uuid = TokenManager.extract_uuid_from_req_header()
        return not device_uuid

    @staticmethod
    def get_refresh_token_from_request():
        is_browser = TokenManager.is_browser()
        if is_browser:
            return request.cookies.get("rt")

        # MOBILE
        return TokenManager.extract_bearer_token_from_req_header()

    @staticmethod
    def verify_jwt_token(token: str):
        """
        wrap into try .. except, catch PyJWTError
        :param token:
        :return:
        """
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG], options={"require": ["iat"]})

    @staticmethod
    def get_data_from_token_body(token: str, key: str):
        try:
            token_body = TokenManager.verify_jwt_token(token)
            return token_body[key]
        except PyJWTError:
            response = U.make_failed_response('PY_JWT_ERROR_OCCURRED', 400)
            abort(response)

    @staticmethod
    def get_token_family(refresh_token: str) -> str:
        token_family = TokenManager.get_data_from_token_body(refresh_token, "token_family")
        TokenManager.check_refresh_token_family(token_family)

        return token_family

    @staticmethod
    def tokens_are_not_matched(client_token: str, database_token: str) -> bool:
        client_token_iat = TokenManager.get_data_from_token_body(client_token, 'iat')
        database_token_iat = TokenManager.get_data_from_token_body(database_token, 'iat')
        return client_token_iat != database_token_iat

    @staticmethod
    def generate_token_pair(token_family: UUID, user_id: int, user_name: str) -> dict:
        TokenManager.check_refresh_token_family(token_family)

        access_token_body = {
            "user_id": user_id,
            "user_name": user_name,
            "iat": datetime.now(tz=timezone.utc),
            "exp": datetime.now(tz=timezone.utc) + timedelta(minutes=30)
            # "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=10)
        }

        refresh_token_body = {
            "token_family": token_family,
            "iat": datetime.now(tz=timezone.utc),
            "exp": datetime.now(tz=timezone.utc) + timedelta(days=REFRESH_TOKEN_LIFE_TIME)
        }

        access_token = jwt.encode(access_token_body, JWT_SECRET, algorithm=JWT_ALG)
        refresh_token = jwt.encode(refresh_token_body, JWT_SECRET, algorithm=JWT_ALG)

        return {
            "access_token": f'Bearer {access_token}',
            "refresh_token": refresh_token
        }

    @staticmethod
    def find_token_query_with_same_token_family(refresh_token: str):
        token_family = TokenManager.get_token_family(refresh_token)
        refresh_token_query: RefreshToken = RefreshToken.query.filter(
            RefreshToken.token_family == token_family
        ).one_or_none()

        if refresh_token_query is None:
            return abort(U.make_failed_response("REFRESH_TOKEN_NOT_FOUND", 401))

        return refresh_token_query

    @staticmethod
    def create_response(token_pair: dict, status: int):
        is_browser = TokenManager.is_browser()
        refresh_token = None

        # if client is browser return refresh_token as HTTPOnly Cookie instead of a part of response body
        if is_browser:
            refresh_token = token_pair.pop("refresh_token")

        resp_body_dict = U.make_resp_json_body(U.success, token_pair)
        response = make_response(jsonify(resp_body_dict), status)
        if is_browser and refresh_token is not None:
            same_site_value = None if os.environ.get("DEBUG", False) else "Strict"
            expire_date = datetime.now(tz=timezone.utc) + timedelta(days=REFRESH_TOKEN_LIFE_TIME)
            response.set_cookie(
                "rt", refresh_token,
                expires=expire_date,
                httponly=True,
                secure=True,
                samesite=same_site_value,
                path="/api/auth"
            )

        return response

    @staticmethod
    def create_new_refresh_token(user: User) -> RefreshToken:
        """
        Creates RefreshToken instance bounded to existed User instance
        :param user: User
        :return: RefreshToken
        """
        refresh_token = RefreshToken()
        user.refresh_tokens.append(refresh_token)

        db_session.commit()

        return refresh_token

    @staticmethod
    def get_refresh_token_query(user: User) -> RefreshToken:
        """
        QUERY = RefreshToken Database Query (got by token_family)
        REFRESH_TOKEN = refresh token coming with request (headers, cookie, body nvm)
        If REFRESH_TOKEN does not exist OR QUERY does not exist
            Create new RefreshToken(). Return it.
        Else:
            Return QUERY
        :param user: User
        :return: RefreshToken
        """
        refresh_token = TokenManager.get_refresh_token_from_request()

        if not refresh_token:
            return TokenManager.create_new_refresh_token(user)

        token_family = TokenManager.get_token_family(refresh_token)

        refresh_token_query = RefreshToken.query.filter(RefreshToken.token_family == token_family).one_or_none()
        if refresh_token_query is None:
            return TokenManager.create_new_refresh_token(user)

        return refresh_token_query

    @staticmethod
    def cross_link_refresh_token(refresh_token_query: RefreshToken, user: User):
        """
        QUERY = RefreshToken Database Query
        1) Generate new Token Pair:
            - Refresh Token contains QUERY's token_family uuid,
            - Access Token contains user_id
        2) Update QUERY with generated refresh JWT-token (step 1)
        :param refresh_token_query: Refresh Token
        :param user: User
        :return: token pair
        """
        token_pair = TokenManager.generate_token_pair(refresh_token_query.token_family, user.id, user.username)
        # update RefreshToken model with generated JWT-token
        refresh_token_query.token = token_pair["refresh_token"]
        db_session.commit()
        return token_pair

    @staticmethod
    def check_refresh_token_family(token_family: UUID):
        if not token_family:
            # Token family must be included into Refresh Token! Token family generated at Refresh Token creation
            abort(U.make_error_response("NO_TOKEN_FAMILY_INTO_TOKEN"))

