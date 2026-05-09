from datetime import datetime

from mongoengine import (
    DateTimeField,
    DictField,
    Document,
    EmbeddedDocument,
    EmbeddedDocumentListField,
    IntField,
    ReferenceField,
    StringField,
)


class HistoryEntry(EmbeddedDocument):
    timestamp = DateTimeField(required=True)
    changed_by = StringField(required=True)
    field = StringField(required=True)
    old_value = StringField()
    new_value = StringField()


class LoanInfo(EmbeddedDocument):
    borrower_name = StringField()
    expected_return = DateTimeField()
    notes = StringField()


class Attachment(EmbeddedDocument):
    filename = StringField(required=True)
    mime_type = StringField()
    data = StringField()
    uploaded_at = DateTimeField(default=datetime.utcnow)


class SequenceCounter(Document):
    meta = {"collection": "sequence_counters"}

    key = StringField(required=True, unique=True)
    value = IntField(default=0)


class Component(Document):
    meta = {"collection": "components"}

    code = StringField(required=True, unique=True)
    component_type = ReferenceField("ComponentType", required=True)
    status = StringField(
        required=True,
        choices=[
            "available",
            "in_use",
            "loaned",
            "under_maintenance",
            "decommissioned",
        ],
        default="available",
    )
    diagnostic_data = DictField()
    notes = StringField()
    loan_info = EmbeddedDocumentField(LoanInfo)
    attachments = EmbeddedDocumentListField(Attachment)
    history = EmbeddedDocumentListField(HistoryEntry)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
