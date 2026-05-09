import re

from mongoengine import Q

from app.features.component_types.models import ComponentType
from app.features.components.models import Component

ALLOWED_SORT_FIELDS = {"created_at", "updated_at", "status", "code"}


def list_inventory(
    type_slug: str | None = None,
    status_filter: str | None = None,
    q: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
) -> tuple[list[Component], int]:
    page_size = min(page_size, 100)
    if page < 1:
        page = 1

    if sort_by not in ALLOWED_SORT_FIELDS:
        sort_by = "created_at"
    if sort_dir not in ("asc", "desc"):
        sort_dir = "desc"

    query = {}

    if type_slug is not None:
        ct = ComponentType.objects(slug=type_slug).first()
        if not ct:
            return [], 0
        query["component_type"] = ct

    if status_filter is not None:
        query["status"] = status_filter

    if q is not None and q.strip():
        escaped = re.escape(q.strip())
        query["__raw__"] = {
            "$or": [
                {"code": {"$regex": escaped, "$options": "i"}},
                {"notes": {"$regex": escaped, "$options": "i"}},
            ]
        }

    query_obj = Component.objects(**query)
    total = query_obj.count()

    sort_prefix = "" if sort_dir == "asc" else "-"
    sort_str = f"{sort_prefix}{sort_by}"

    skip = (page - 1) * page_size
    items = list(
        query_obj.order_by(sort_str).skip(skip).limit(page_size)
    )

    return items, total
