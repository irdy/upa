from flask import jsonify, request
from database import db_session
from use_push_app import app
from use_push_app.controllers.push_subscriptions_controller import validate_push_sub, construct_push_sub
from use_push_app.models.models import Contact, User
from use_push_app.utils import U, QueryUtils, Validator


@app.route('/api/users/<int:user_id>/contacts', methods=['POST'])
def create_contact(user_id):
    data = U.get_request_payload()

    contact_info = data["contact_info"]
    push_subscription = data["push_subscription"]

    Validator.validate_required_keys(contact_info, ["name"])
    Validator.validate_unique(Contact, 'Contact', 'name', contact_info["name"])
    validate_push_sub(push_subscription)

    contact = Contact(name=contact_info["name"], user_id=user_id)

    _push_subscription = construct_push_sub(push_subscription, request)
    contact.push_subscriptions.append(_push_subscription)

    db_session.add(contact)
    db_session.commit()

    return QueryUtils.make_success_response("CREATED", 'Contact', contact)


@app.route('/api/users/<int:user_id>/contacts')
def get_contacts(user_id):
    user_query = QueryUtils.get_query_by_id(User, user_id)
    if user_query is None:
        return QueryUtils.make_does_not_exist_resp('User', user_id)

    contacts = Contact.query.filter(Contact.user_id == user_id)
    resp_body_dict = U.make_resp_json_body(U.success, dict(contacts=[contact.to_dict() for contact in contacts]))
    return jsonify(resp_body_dict)


@app.route('/api/contacts/<int:contact_id>')
def get_contact(contact_id):
    return QueryUtils.read(Contact, contact_id, 'Contact')


@app.route('/api/contacts/<int:contact_id>', methods=['DELETE', 'PATCH'])
def update_delete_contact(contact_id):
    if request.method == 'PATCH':
        return patch_contact(contact_id)
    elif request.method == 'DELETE':
        return QueryUtils.delete(Contact, contact_id, 'Contact')


def patch_contact(contact_id: int):
    body = U.get_request_payload()
    data = body['contact_info']
    return QueryUtils.update(Contact, 'Contact', contact_id, ['name'], data)

