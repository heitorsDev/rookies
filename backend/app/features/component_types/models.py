from datetime import datetime

from mongoengine import (
    BooleanField,
    DateTimeField,
    Document,
    DynamicField,
    EmbeddedDocument,
    EmbeddedDocumentListField,
    FloatField,
    ListField,
    StringField,
)


class FieldDefinition(EmbeddedDocument):
    field_id = StringField(required=True)
    label = StringField(required=True)
    field_type = StringField(required=True)
    required = BooleanField(default=False)
    default = DynamicField()
    options = ListField(StringField())
    min_value = FloatField()
    max_value = FloatField()
    unit = StringField()
    placeholder = StringField()
    help_text = StringField()
    auto = BooleanField(default=False)
    auto_hint = StringField()


class ComponentType(Document):
    meta = {"collection": "component_types"}

    name = StringField(required=True, unique=True)
    slug = StringField(required=True, unique=True)
    description = StringField()
    fields = EmbeddedDocumentListField(FieldDefinition)
    is_archived = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    @property
    def id(self) -> str:
        return str(self.pk)
