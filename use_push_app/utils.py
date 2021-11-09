"""
create response body dict in `JSend` spec. format
example:
{
    status : "Utils.success",
    data : {
        "posts" : [
            { "id" : 1, "title" : "A blog post", "body" : "Some useful content" },
            { "id" : 2, "title" : "Another blog post", "body" : "More content" },
        ]
    },
    message: null
}
"""
from functools import reduce
from typing import Any, List

from flask import make_response, jsonify
from database import db_session, Base
from use_push_app.messages import messages


class U:
    # available response statuses:
    success = "success"
    fail = "fail"
    error = "error"

    @staticmethod
    def make_resp_json_body(status: str, data: dict = None, message: str = None) -> dict:
        return dict(
            status=status,
            data=data,
            message=message
        )

    @staticmethod
    def extract_request_body(request) -> dict or None:
        if request.is_json:
            return request.get_json()
        elif request.form:
            return request.form.to_dict()
        else:
            return None

    @staticmethod
    def make_incorrect_request_content_type_resp():
        resp_body_dict = U.make_resp_json_body(U.fail, None, 'Data must be a valid JSON or FormData!')
        return make_response(jsonify(resp_body_dict), 400)

    @staticmethod
    def make_is_not_allowed_for_update_keys_resp(is_not_allowed_for_update_keys_dict: dict):
        resp_body_dict = U.make_resp_json_body(U.fail, is_not_allowed_for_update_keys_dict)
        return make_response(jsonify(resp_body_dict), 400)

    @staticmethod
    def to_snake_case(string: str):
        return reduce(lambda x, y: x + ('_' if y.isupper() else '') + y, string).lower()


class QueryUtils:
    @staticmethod
    def get_query_by_id(model, _id: int):
        return model.query.filter(model.id == _id).one_or_none()

    @staticmethod
    def make_does_not_exist_resp(model_name: str, _id: int):
        resp_body_dict = U.make_resp_json_body(
            U.fail,
            None,
            messages['NO_EXISTS'](model_name, 'id', dict(id=_id))
        )

        return make_response(jsonify(resp_body_dict), 404)

    @staticmethod
    def update(model, model_name: str, _id: int, allowed_keys_for_update: List[str], data: dict):
        base_query = model.query.filter_by(id=_id)
        query = base_query.one_or_none()

        if query is None:
            return QueryUtils.make_does_not_exist_resp(model_name, _id)

        error_response = Validator.validate_required_keys(data, allowed_keys_for_update)
        if error_response is not None:
            return error_response

        error_response = Validator.validate_allowed_keys_for_update(data, allowed_keys_for_update)
        if error_response is not None:
            return error_response

        base_query.update(data)
        db_session.commit()

        return QueryUtils.make_success_response('UPDATED', model_name, query)

    @staticmethod
    def delete(model, _id, model_name):
        query = QueryUtils.get_query_by_id(model, _id)
        if query is None:
            return QueryUtils.make_does_not_exist_resp(model_name, _id)

        db_session.delete(query)
        db_session.flush()
        db_session.commit()

        return QueryUtils.make_success_response("DELETED", model_name, query)

    @staticmethod
    def read(model, _id: int, model_name: str):
        query = QueryUtils.get_query_by_id(model, _id)
        if query is None:
            return QueryUtils.make_does_not_exist_resp(model_name, _id)

        resp_json_body = U.make_resp_json_body(U.success, {U.to_snake_case(model_name): query.to_dict()})
        return jsonify(resp_json_body)

    @staticmethod
    def make_success_response(message_type: str, model_name: str, model_instance: Base):
        message = messages[message_type](model_name, 'id', model_instance.to_dict())
        if message_type == "DELETED":
            data = None
        else:
            data = dict()
            data[U.to_snake_case(model_name)] = model_instance.to_dict()

        if message_type == 'CREATED':
            status_code = 201
        else:
            status_code = 200

        resp_body_dict = U.make_resp_json_body(U.success, data, message)
        return make_response(jsonify(resp_body_dict), status_code)


class Validator:
    @staticmethod
    def validate_unique(model: Any, model_name: str, unique_key: str, value: str):
        query = model.query.filter(getattr(model, unique_key) == value).one_or_none()

        if query is not None:
            resp_body_dict = U.make_resp_json_body(
                U.fail,
                None,
                messages['ALREADY_EXISTS'](model_name, unique_key, query.to_dict())
            )

            return make_response(resp_body_dict, 409)

        return None

    @staticmethod
    def validate_required_keys(data: dict, required_keys: List[str]):
        validation_errors = dict()

        for key in required_keys:
            if key not in data:
                validation_errors[key] = f"{key} is required"

        if validation_errors:
            resp_body_dict = U.make_resp_json_body(U.fail, validation_errors)
            return make_response(jsonify(resp_body_dict), 400)

        return None

    # check keys are in body allowed for patching
    # @param allowed_keys_for_update - only these fields are allowed for patching
    @staticmethod
    def validate_allowed_keys_for_update(data: dict, allowed_keys_for_update: List[str]):
        is_not_allowed_for_update_keys_dict = dict()

        diff = list(set(data.keys()) - set(allowed_keys_for_update))
        for key in diff:
            is_not_allowed_for_update_keys_dict[key] = f"{key} can't be patched"

        if is_not_allowed_for_update_keys_dict:
            return U.make_is_not_allowed_for_update_keys_resp(is_not_allowed_for_update_keys_dict)

        return None
