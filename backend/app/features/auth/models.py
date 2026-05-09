from datetime import datetime

from mongoengine import BooleanField, DateTimeField, Document, StringField


class Member(Document):
    meta = {"collection": "members"}

    name = StringField(required=True)
    username = StringField(required=True, unique=True)
    role = StringField(required=True, choices=["member", "admin"], default="member")
    is_active = BooleanField(default=True)
    login_token_hash = StringField()
    token_issued_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    created_by = StringField()
