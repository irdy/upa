
from flask import request, jsonify
from database import db_session
from use_push_app import app
from use_push_app.models.models import PushSubscription, Contact
from use_push_app.utils import QueryUtils, Validator, U


@app.route('/api/contacts/<int:contact_id>/push_subscriptions', methods=['POST'])
def create_push_sub(contact_id):
    data = U.get_request_payload()
    validate_push_sub(data)

    push_subscription = construct_push_sub(data, request, contact_id)
    db_session.add(push_subscription)
    db_session.commit()

    return QueryUtils.make_success_response('CREATED', 'PushSubscription', push_subscription)


@app.route('/api/contacts/<int:contact_id>/push_subscriptions')
def get_push_subscriptions(contact_id):
    contact_query = QueryUtils.get_query_by_id(Contact, contact_id)
    if contact_query is None:
        return QueryUtils.make_does_not_exist_resp('Contact', contact_id)

    push_subscriptions = PushSubscription.query.filter(PushSubscription.contact_id == contact_id)
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


def get_user_agent(_request):
    return _request.headers.get('user-agent')


def construct_push_sub(data: dict, _request, contact_id=None):
    return PushSubscription(
        sub_endpoint=data["sub_endpoint"],
        user_agent=get_user_agent(request),
        contact_id=contact_id
    )


def get_push_sub_by_endpoint(sub_endpoint: str):
    return PushSubscription.query.filter(PushSubscription.sub_endpoint == sub_endpoint).one_or_none()


# data = {sub_endpoint: "hash2655237"}
def validate_push_sub(data: dict):
    sub_endpoint_key = 'sub_endpoint'
    Validator.validate_required_keys(data, [sub_endpoint_key])

    Validator.validate_unique(
        PushSubscription,
        'PushSubscription',
        sub_endpoint_key,
        data[sub_endpoint_key]
    )

    return None

