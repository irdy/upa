from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy_serializer import SerializerMixin


class User(Base, SerializerMixin):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50))
    auth_token = Column(String(200))
    contacts = relationship("Contact", cascade="all, delete-orphan")

    def __init__(self, username, password=None, auth_token=None):
        self.username = username
        self.password = password
        self.auth_token = auth_token

    def __repr__(self):
        return f'<User {self.username!r}>'


class Contact(Base, SerializerMixin):
    __tablename__ = 'contacts'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    push_subscriptions = relationship("PushSubscription", cascade="all, delete-orphan")

    def __init__(self, name, user_id):
        self.name = name
        self.user_id = user_id

    def __repr__(self):
        return f'<Contact {self.name!r}>'


class PushSubscription(Base, SerializerMixin):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True)
    sub_endpoint = Column(String(200), unique=True, nullable=False)
    user_agent = Column(String(200))

    contact_id = Column(Integer, ForeignKey('contacts.id'))

    def __init__(self, sub_endpoint, user_agent=None, contact_id=None):
        self.sub_endpoint = sub_endpoint
        self.user_agent = user_agent
        self.contact_id = contact_id

    def __repr__(self):
        return f'Push Subscription {self.sub_endpoint}'
