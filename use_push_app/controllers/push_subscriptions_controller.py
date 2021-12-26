from flask import request, jsonify
from database import db_session
from use_push_app import app
from use_push_app.models.models import PushSubscription, User, UserAgent
from use_push_app.utils import QueryUtils, Validator, U


@app.route('/api/users/<int:user_id>/push_subscriptions', methods=['POST'])
def create_push_sub(user_id):
    data = U.get_request_payload()
    validate_push_sub(data)

    push_subscription = construct_push_sub(data, user_id)
    db_session.add(push_subscription)
    user_agent = UserAgent(user_agent=get_user_agent())
    push_subscription.user_agent = user_agent

    db_session.commit()

    print("push_subscription user_agent", push_subscription.user_agent)

    return QueryUtils.make_success_response('CREATED', 'PushSubscription', push_subscription)


@app.route('/api/users/<int:user_id>/push_subscriptions')
def get_push_subscriptions(user_id):
    user_query = QueryUtils.get_query_by_id(User, user_id)
    if user_query is None:
        return QueryUtils.make_does_not_exist_resp('User', user_id)

    push_subscriptions = PushSubscription.query.filter(PushSubscription.user_id == user_id)
    resp_body_dict = U.make_resp_json_body(
        U.success,
        dict(push_subscriptions=[push_sub.to_dict() for push_sub in push_subscriptions])
    )

    return jsonify(resp_body_dict)


@app.route('/api/push_subscriptions/<int:push_sub_id>')
def get_push_subscription(push_sub_id):
    return QueryUtils.read(PushSubscription, push_sub_id, 'PushSubscription')


@app.route('/api/push_subscriptions/<int:push_sub_id>', methods=["DELETE"])
def delete_push_sub(push_sub_id):
    return QueryUtils.delete(PushSubscription, push_sub_id, 'PushSubscription')


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
        expiration_time=data["expirationTime"],
    )

