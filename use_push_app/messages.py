# attention: value must be a key of source!
def get_default_msg(what: str, value: str, source: dict = None) -> str:
    return f"{what} with {value} {source[value]} "


messages = {
    "ALREADY_EXISTS": lambda *args: get_default_msg(*args) + 'already exists',
    "NO_EXISTS": lambda *args: get_default_msg(*args) + 'does not exist',
    'CREATED': lambda *args: get_default_msg(*args) + 'was created',
    'UPDATED': lambda *args: get_default_msg(*args) + 'was updated',
    'DELETED': lambda *args: get_default_msg(*args) + 'was deleted',
    'MUST_BE_A_JSON': 'Request Content-Type must be a valid JSON'
}

