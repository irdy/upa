import os
from flask import request, jsonify
from database import db_session
from use_push_app import app
from use_push_app.models.models import PushSubscription, User, UserAgent
from use_push_app.utils import QueryUtils, Validator, U
import base64
from pywebpush import webpush, WebPushException
import json
from use_push_app.token_manager import TokenManager


@app.route('/api/users/<int:user_id>/push_subscriptions', methods=['POST'])
def create_push_sub(user_id):
    data = U.get_request_payload()
    validate_push_sub(data)

    push_subscription = construct_push_sub(data, user_id)
    db_session.add(push_subscription)
    user_agent = UserAgent(user_agent=get_user_agent())
    push_subscription.user_agent = user_agent

    db_session.commit()

    return QueryUtils.make_success_response('CREATED', 'PushSubscription', push_subscription)


@app.route('/api/users/<int:user_id>/subscribed_devices')
def get_subscribed_devices(user_id):
    user_query = QueryUtils.get_query_by_id(User, user_id)
    if user_query is None:
        return QueryUtils.make_does_not_exist_resp('User', user_id)

    subscribed_devices = db_session.query(UserAgent) \
        .join(PushSubscription) \
        .filter(PushSubscription.user_id == user_id) \
        .filter(UserAgent.push_subscription_id == PushSubscription.id) \
        .all()

    subscribed_devices = dict(
        subscribed_devices=[subscribed_device.to_dict() for subscribed_device in subscribed_devices]
    )

    resp_body_dict = U.make_resp_json_body(
        U.success,
        subscribed_devices
    )

    return jsonify(resp_body_dict)


# admin only
# @app.route('/api/users/<int:user_id>/push_subscriptions')
# def get_push_subscriptions(user_id):
#     user_query = QueryUtils.get_query_by_id(User, user_id)
#     if user_query is None:
#         return QueryUtils.make_does_not_exist_resp('User', user_id)
#
#     push_subscriptions = PushSubscription.query.filter(PushSubscription.user_id == user_id)
#     resp_body_dict = U.make_resp_json_body(
#         U.success,
#         dict(push_subscriptions=[push_sub.to_dict() for push_sub in push_subscriptions])
#     )
#
#     return jsonify(resp_body_dict)
#
#
# # admin only
# @app.route('/api/push_subscriptions/<int:push_sub_id>')
# def get_push_subscription(push_sub_id):
#     return QueryUtils.read(PushSubscription, push_sub_id, 'PushSubscription')


@app.route('/api/push_subscriptions/<push_sub_endpoint_base64>', methods=["DELETE"])
def delete_push_sub(push_sub_endpoint_base64):
    push_sub_endpoint = base64.b64decode(push_sub_endpoint_base64).decode('utf-8')
    push_subscription_query = get_push_sub_by_endpoint(push_sub_endpoint)
    if push_subscription_query is None:
        response = U.make_failed_response("SUBSCRIPTION_NOT_FOUND", 404)
        return response

    return QueryUtils.delete(PushSubscription, push_subscription_query.id, 'PushSubscription')


@app.route('/api/push_subscriptions/send', methods=["POST"])
def send_push_notification():
    data = U.get_request_payload()
    Validator.validate_required_keys(data, ["message_body", "sub_ids"])

    # todo validate data, message length, sub_ids is array of integer, DataValidatorClass

    message_body = data["message_body"]
    sub_ids = data["sub_ids"]

    sender_user_id = TokenManager.get_user_id()
    user_query = User.query.filter(User.id == sender_user_id).one_or_none()
    if user_query is None:
        return U.make_error_response("TOKEN_IS_NOT_BIND_TO_USER")

    sender_user_name = user_query.username

    result = dict(
        not_existed_subs = [],
        delivered = [],
        not_delivered = []
    )

    for sub_id in sub_ids:
        push_sub_query = get_subscription_endpoint_by_sub_id(sub_id)
        if push_sub_query is None:
            result.not_existed_subs.append(sub_id)

        try:
            push_data = {
                "title": "Message from " + sender_user_name,
                "message": message_body
            }

            json_data = json.dumps(push_data)

            webpush(
                subscription_info={
                    "endpoint": push_sub_query.endpoint,
                    "keys": {
                        "p256dh": push_sub_query.p256dh,
                        "auth": push_sub_query.auth
                    }},
                data=json_data,
                vapid_private_key=os.getenv("APP_PUSH_VAPID_PRIVATE_KEY"),
                vapid_claims={
                    "sub": "mailto:need.more2017@yandex.ru",
                }
            )
            result.get("delivered").append(sub_id)
        except WebPushException as ex:
            result.get("not_delivered").append(sub_id)
            print("WebPushException: {}", repr(ex))
            # Mozilla returns additional information in the body of the response.
            if ex.response and ex.response.json():
             extra = ex.response.json()
             print("Remote service replied with a {}:{}, {}",
                extra.code,
                extra.errno,
                extra.message
             )

    resp_body_dict = U.make_resp_json_body(
        U.success,
        result
    )

    return jsonify(resp_body_dict)


def dict_to_binary(dict: dict):
    str = json.dumps(dict)
    binary = ' '.join(format(ord(letter), 'b') for letter in str)
    return binary


def get_subscription_endpoint_by_sub_id(id: int):
    return PushSubscription.query.filter(PushSubscription.id == id).one_or_none()


def get_user_agent():
    return request.headers.get('user-agent')


def get_push_sub_by_endpoint(endpoint: str):
    return PushSubscription.query.filter(PushSubscription.endpoint == endpoint).one_or_none()


"""
    Data example:
    data = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/jqwjewqe-wqewqeqw-ewqewqewqeqw",
        "expirationTime": null,
        "keys": {
            "p256dh": "BBw4J8oovY9UnjqwiebeF-vbPwqD2297D2JPKH-BDqweO2I9kz9fAt0PQEKU_aV--oe1ddcwl59dQUs",
            "auth": "wXTqRMVV42HnKWYBNMb4go"
        }
    }
"""
def validate_push_sub(data: dict):
    endpoint_key = 'endpoint'
    Validator.validate_required_keys(data, [endpoint_key, "keys"])

    Validator.validate_unique(
        PushSubscription,
        'PushSubscription',
        endpoint_key,
        data[endpoint_key]
    )

    return None

def construct_push_sub(data: dict, user_id):
    keys = data["keys"]
    p256dh = keys["p256dh"]
    auth = keys["auth"]

    return PushSubscription(
        endpoint=data["endpoint"],
        p256dh=p256dh,
        auth=auth,
        user_id=user_id,
        expiration_time=data.get("expirationTime"),
    )

