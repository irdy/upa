import uuid
import bcrypt
from sqlalchemy import Column, Integer, String, ForeignKey, func, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property


class User(Base, SerializerMixin):
    __tablename__ = 'users'

    serialize_only = ('id', 'username', 'created_at', 'updated_at')

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    invited_by = Column(Integer)

    contacts = relationship("Contact", cascade="all, delete-orphan")
    push_subscriptions = relationship("PushSubscription", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", cascade="all, delete-orphan")
    invitation_links = relationship("InvitationLink", cascade="all, delete-orphan")

    @hybrid_property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, password: str):
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password_hash = pw_hash.decode('utf-8')

    def __init__(self, username, password, user_id=None):
        self.username = username
        self.password = password
        self.invited_by = user_id

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username!r}>'


class InvitationLink(Base, SerializerMixin):
    __tablename__ = 'invitation_links'

    id = Column(Integer, primary_key=True)
    link_uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey('users.id'))

    def __init__(self, user_id: str):
        self.user_id = user_id

    def __repr__(self):
        return f'<Contact {self.link_uuid!r}>'


class RefreshToken(Base, SerializerMixin):
    __tablename__ = 'refresh_tokens'

    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True)
    token_family = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey('users.id'))

    def __init__(self, token=None):
        self.token = token

    def __repr__(self):
        return f'<Refresh Token {self.token!r}'


class Contact(Base, SerializerMixin):
    __tablename__ = 'contacts'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    contact_user_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))

    def __init__(self, name, contact_user_id):
        self.name = name
        self.contact_user_id = contact_user_id

    def __repr__(self):
        return f'<Contact {self.name!r}>'


class PushSubscription(Base, SerializerMixin):
    __tablename__ = "push_subscriptions"

    serialize_only = ('id', 'endpoint', 'user_id', 'created_at')

    id = Column(Integer, primary_key=True)
    endpoint = Column(String(300), unique=True, nullable=False)
    expiration_time = Column(String(200)) # ?
    p256dh = Column(String(200), nullable=False)
    auth = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(Integer, ForeignKey('users.id'))

    user_agent = relationship("UserAgent", back_populates="push_subscription", uselist=False, cascade="all, delete-orphan")

    def __init__(self, endpoint, p256dh, auth, user_id, expiration_time=None):
        self.endpoint = endpoint
        self.p256dh = p256dh
        self.auth = auth
        self.expiration_time = expiration_time
        self.user_id = user_id

    def __repr__(self):
        return f'Push Subscription {self.endpoint}'

class UserAgent(Base, SerializerMixin):
    __tablename__ = "user_agents"

    serialize_only = ('id', 'user_agent', 'push_subscription_id')

    id = Column(Integer, primary_key=True)
    user_agent = Column(String(200))

    push_subscription_id = Column(Integer, ForeignKey('push_subscriptions.id'))
    push_subscription = relationship("PushSubscription", back_populates="user_agent")

    def __init__(self, user_agent): #, push_subscription_id):
        self.user_agent = user_agent
        # self.push_subscription_id = push_subscription_id

    def __repr__(self):
        return f'User Agent {self.user_agent}'

