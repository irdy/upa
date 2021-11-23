import json
from flask import Request, Response
from jwt import PyJWTError
from use_push_app.exceptions import UnauthorizedException, InvalidTokenException
from use_push_app.token_manager import TokenManager
from use_push_app.utils import U


class AuthMiddleware:

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)

        public_paths = [
            '/sign_in',
            '/sign_up',
            '/api/auth/sign_in',
            '/api/auth/sign_up',
            # '/api/auth/sign_out',
            '/api/auth/refresh_tokens',
            '/sandbox'
        ]

        ### CORS ###
        # if request.method == "OPTIONS":  # CORS preflight
        #     res = AuthMiddleware._build_cors_preflight_response()
        #     return res(environ, start_response)

        if request.path not in public_paths and not request.path.startswith('/static'):
            # check Access Token
            bearer_token = request.headers.get("Authorization")
            try:
                if not bearer_token:
                    raise UnauthorizedException

                access_token = TokenManager.parse_bearer_token(bearer_token)
                TokenManager.verify_jwt_token(access_token)

                return self.app(environ, start_response)

            except (UnauthorizedException, InvalidTokenException, PyJWTError) as e:
                resp_body_dict = U.make_resp_json_body(U.fail, None, "Unauthorized")
                json_data = json.dumps(resp_body_dict)

                res = Response(json_data, mimetype='application/json', content_type='application/json', status=401)
                return res(environ, start_response)

        return self.app(environ, start_response)

    # @staticmethod
    # def _build_cors_preflight_response():
    #     response = Response("allow cors", mimetype='text/plain')
    #     response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    #     response.headers.add('Access-Control-Allow-Headers', "*")
    #     response.headers.add('Access-Control-Allow-Methods', "*")
    #     return response
    #
    # @staticmethod
    # def _corsify_actual_response(response=Response()):
    #     response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    #     return response
