import json
from flask import Request, Response
from jwt import PyJWTError, ExpiredSignatureError
from use_push_app.exceptions import UnauthorizedException, InvalidTokenException
from use_push_app.token_manager import TokenManager
from use_push_app.utils import U
import os
from flask_cors import CORS

class AuthMiddleware:

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)

        public_paths = [
            '/api/auth/sign_in',
            '/api/auth/sign_up',
            '/api/auth/refresh_tokens',
        ]

        if request.method == "GET":
            if request.path.startswith('/api'):
                is_api_request = 'X_UUID' in request.headers
                if not is_api_request:
                    print("no api request", request.path)
                    return self.app(environ, start_response)

            return self.app(environ, start_response)

        if request.method == "OPTIONS":
            return self.app(environ, start_response)

        if request.path not in public_paths:
            # check Access Token
            bearer_token = request.headers.get("Authorization")
            try:
                if not bearer_token:
                    raise UnauthorizedException

                access_token = TokenManager.parse_bearer_token(bearer_token)
                TokenManager.verify_jwt_token(access_token)

                return self.app(environ, start_response)

            except ExpiredSignatureError as e:
                resp_body_dict = U.make_resp_json_body(U.fail, None, "ExpiredSignatureError")
                json_data = json.dumps(resp_body_dict)

                print("json_data", json_data)

                headers = [
                    ('Content-Type', 'application/json'),
                ]

                headers = enable_cors(headers)

                res = Response(response=json_data, headers=headers, status=401)
                return res(environ, start_response)

            except (UnauthorizedException, InvalidTokenException, PyJWTError) as e:
                print("Auth Middleware Error - ", e)

                resp_body_dict = U.make_resp_json_body(U.fail, None, "Unauthorized")
                json_data = json.dumps(resp_body_dict)

                headers = [
                    ('Content-Type', 'application/json'),
                ]

                headers = enable_cors(headers)

                res = Response(json_data, mimetype='application/json', content_type='application/json', status=401)
                return res(environ, start_response)

        return self.app(environ, start_response)

def enable_cors(headers):
    debug = os.environ.get("DEBUG", False)
    if debug:
        # CORS (how to enable CORS with flask-cors here??)
        headers.extend([
            ('Access-Control-Allow-Credentials', 'true'),
            ('Access-Control-Allow-Headers', 'authorization, content-type, x-uuid'),
            ('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT'),
            ('Access-Control-Allow-Origin', 'http://localhost:3000'),
            ('Allow', 'OPTIONS, POST, GET, HEAD'),
        ])

    return headers
