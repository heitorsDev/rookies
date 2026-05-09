import json
from datetime import datetime

from fastapi import HTTPException, status

from app.features.component_types.models import ComponentType, FieldDefinition
from app.features.components.models import Component, HistoryEntry, LoanInfo, SequenceCounter


def _generate_code(slug: str) -> str:
    clean_slug = slug.replace("-", "")[:10]
    year = datetime.utcnow().year
    counter_key = f"{clean_slug}-{year}"

    counter = SequenceCounter.objects(key=counter_key).modify(
        upsert=True,
        new=True,
        inc__value=1,
    )
    seq = str(counter.value).zfill(3)

    return f"{clean_slug}-{year}-{seq}"


def _validate_diagnostic_data(
    fields: list[FieldDefinition], data: dict
) -> None:
    field_ids = {f.field_id for f in fields}
    required_ids = {f.field_id for f in fields if f.required}

    unknown = set(data.keys()) - field_ids
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown fields: {', '.join(sorted(unknown))}",
        )

    missing = required_ids - set(data.keys())
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Missing required fields: {', '.join(sorted(missing))}",
        )


def _serialize_value(value) -> str:
    if isinstance(value, (dict, list)):
        return json.dumps(value, default=str)
    if value is None:
        return ""
    return str(value)


def _log_history(
    component: Component, field: str, old_value, new_value, changed_by: str
) -> None:
    entry = HistoryEntry(
        timestamp=datetime.utcnow(),
        changed_by=changed_by,
        field=field,
        old_value=_serialize_value(old_value),
        new_value=_serialize_value(new_value),
    )
    component.history.append(entry)


def create_component(
    component_type_slug: str,
    diagnostic_data: dict,
    notes: str | None,
    status_value: str,
    member_username: str,
) -> Component:
    component_type = ComponentType.objects(
        slug=component_type_slug, is_archived=False
    ).first()
    if not component_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component type '{component_type_slug}' not found or is archived",
        )

    _validate_diagnostic_data(component_type.fields, diagnostic_data)

    code = _generate_code(component_type_slug)

    component = Component(
        code=code,
        component_type=component_type,
        status=status_value,
        diagnostic_data=diagnostic_data,
        notes=notes,
    )
    _log_history(component, "component", None, "created", member_username)
    if diagnostic_data:
        _log_history(
            component,
            "diagnostic_data",
            None,
            json.dumps(diagnostic_data, default=str),
            member_username,
        )
    _log_history(component, "status", None, status_value, member_username)
    component.save()

    return component


def get_component_by_code(code: str) -> Component:
    component = Component.objects(code=code).first()
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{code}' not found",
        )
    return component


def update_component(
    code: str,
    status_value: str | None,
    diagnostic_data: dict | None,
    notes: str | None,
    loan_info_data: dict | None,
    member_username: str,
) -> Component:
    component = get_component_by_code(code)

    if diagnostic_data is not None:
        component_type = component.component_type
        _validate_diagnostic_data(component_type.fields, diagnostic_data)
        _log_history(
            component,
            "diagnostic_data",
            component.diagnostic_data,
            diagnostic_data,
            member_username,
        )
        component.diagnostic_data = diagnostic_data

    if status_value is not None:
        if status_value == component.status:
            pass
        else:
            if status_value == "loaned":
                if loan_info_data is None:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="loan_info is required when status is 'loaned'",
                    )

            _log_history(
                component,
                "status",
                component.status,
                status_value,
                member_username,
            )
            component.status = status_value

            if status_value != "loaned" and component.loan_info:
                _log_history(
                    component,
                    "loan_info",
                    _serialize_value(component.loan_info),
                    None,
                    member_username,
                )
                component.loan_info = None

    resulting_status = status_value if status_value is not None else component.status

    if loan_info_data is not None:
        if resulting_status != "loaned":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="loan_info can only be set when status is 'loaned'",
            )

        _log_history(
            component,
            "loan_info",
            _serialize_value(component.loan_info),
            _serialize_value(loan_info_data),
            member_username,
        )
        component.loan_info = LoanInfo(**loan_info_data)

    if notes is not None and notes != component.notes:
        _log_history(
            component, "notes", component.notes, notes, member_username
        )
        component.notes = notes

    component.updated_at = datetime.utcnow()
    component.save()

    return component


def get_component_history(code: str) -> list[HistoryEntry]:
    component = get_component_by_code(code)
    return list(component.history)
