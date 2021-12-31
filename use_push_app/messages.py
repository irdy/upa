# attention: value must be a key of source!
def get_default_msg(what: str, value: str, source: dict = None) -> str:
    return f"{what} with {value} {source[value]} "


messages = {
    'ALREADY_EXISTS': lambda *args: get_default_msg(*args) + 'already exists',
    'NO_EXISTS': lambda *args: get_default_msg(*args) + 'does not exist',
    'CREATED': lambda *args: get_default_msg(*args) + 'was created',
    'UPDATED': lambda *args: get_default_msg(*args) + 'was updated',
    'DELETED': lambda *args: get_default_msg(*args) + 'was deleted',
    'MUST_BE_A_JSON': 'Request Content-Type must be a valid JSON',
    # 403
    'REFRESH_TOKEN_DOES_NOT_EXIST': 'Refresh Token does not exist in Request',
    'REFRESH_TOKEN_NOT_FOUND': 'Refresh Token with current token family is not found',
    'TOKENS_ARE_NOT_MATCHED': 'Client token is not matched to Server token',
    'NOT_IMPLEMENTED': 'NOT_IMPLEMENTED',
    # 400
    'NO_X-UUID_HEADER': 'X-UUID Header must be included into Request',
    'NO_AUTHORIZATION_HEADER': 'Authorization Header must be included into Request for accessing that resource',
    'PY_JWT_ERROR_OCCURRED': 'PyJWTError occurred',
    'NO_TOKEN_FAMILY_INTO_TOKEN': 'Token family is not found into Refresh Token',
    'INCORRECT_REQUEST_CONTENT_TYPE_HEADER': 'Request Content-Type is incorrect',
    'USER_CREATION_FAILED': 'User creation failed. Try again later',
    'NO_PAYLOAD': 'Incorrect JSON data format. Payload key must be included',
    'USER_IS_LOGGED_OUT': 'Probably User is logged out',
    'VALIDATION_ERROR': 'Validation Error',
    'INVALID_TOKEN': 'Invalid token',
    'UUID_IS_NOT_VALID': 'Badly formed hexadecimal uuid string',
    # 500
    'TOKEN_IS_NOT_BIND_TO_USER': "Can't find User associated with current token",
    'NO_USER_ID_INTO_ACCESS_TOKEN': "Access Token Body does not contain user_id",
    'INVITATION_LINK_NOT_FOUND': "Can't find invitation link in DB!",
    # 404
    'SUBSCRIPTION_NOT_FOUND': "Push subscription not found on server",
}

