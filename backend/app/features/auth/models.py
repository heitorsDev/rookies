from datetime import datetime, timezone

from mongoengine import BooleanField, DateTimeField, Document, StringField, signals


def _utcnow():
    return datetime.now(timezone.utc)


class Member(Document):
    meta = {"collection": "members"}

    name = StringField(required=True)
    username = StringField(required=True, unique=True)
    role = StringField(required=True, choices=["member", "admin"], default="member")
    is_active = BooleanField(default=True)
    login_token_hash = StringField()
    token_issued_at = DateTimeField()
    password_hash = StringField()
    created_at = DateTimeField(default=_utcnow)
    updated_at = DateTimeField(default=_utcnow)
    created_by = StringField()


def _update_updated_at(sender, document):
    document.updated_at = _utcnow()


signals.pre_save.connect(_update_updated_at, sender=Member)
