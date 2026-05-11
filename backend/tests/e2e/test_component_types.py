import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_component_type(client: AsyncClient, auth_headers: dict):
    payload = {
        "name": "Falcon 500 Motor",
        "slug": "falcon500",
        "description": "Brushless motor by CTRE.",
        "fields": [
            {
                "field_id": "device_id",
                "label": "CAN Device ID",
                "field_type": "number",
                "required": True,
                "min_value": 0,
                "max_value": 62,
            },
            {
                "field_id": "firmware_version",
                "label": "Firmware Version",
                "field_type": "text",
                "required": True,
                "auto": True,
                "auto_hint": "Paste from Phoenix Tuner X.",
            },
            {
                "field_id": "fault_flags",
                "label": "Active Faults",
                "field_type": "multiselect",
                "options": ["Hardware Failure", "Under Voltage"],
            },
        ],
    }

    response = await client.post(
        "/api/v1/component-types",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Falcon 500 Motor"
    assert data["slug"] == "falcon500"
    assert len(data["fields"]) == 3
    assert data["is_archived"] is False


@pytest.mark.asyncio
async def test_create_component_type_duplicate_slug(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Falcon Motor", "slug": "falcon500"},
        headers=auth_headers,
    )

    response = await client.post(
        "/api/v1/component-types",
        json={"name": "Another Falcon", "slug": "falcon500"},
        headers=auth_headers,
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_create_component_type_invalid_slug(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/component-types",
        json={"name": "Test Type", "slug": "Invalid Slug!"},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_component_type(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "SPARK MAX", "slug": "sparkmax"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/component-types/sparkmax",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "sparkmax"
    assert data["name"] == "SPARK MAX"


@pytest.mark.asyncio
async def test_get_nonexistent_component_type(client: AsyncClient, auth_headers: dict):
    response = await client.get(
        "/api/v1/component-types/nonexistent",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_component_types(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Falcon 500", "slug": "falcon500"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/component-types",
        json={"name": "SPARK MAX", "slug": "sparkmax"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/component-types",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(ct["is_archived"] is False for ct in data)


@pytest.mark.asyncio
async def test_list_component_types_excludes_archived_by_default(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Active Type", "slug": "activetype"},
        headers=auth_headers,
    )
    ct_response = await client.post(
        "/api/v1/component-types",
        json={"name": "Archived Type", "slug": "archivedtype"},
        headers=auth_headers,
    )
    await client.delete(
        "/api/v1/component-types/archivedtype",
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/component-types",
        headers=auth_headers,
    )
    slugs = [ct["slug"] for ct in response.json()]
    assert "activetype" in slugs
    assert "archivedtype" not in slugs


@pytest.mark.asyncio
async def test_list_component_types_includes_archived_when_requested(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Active Type", "slug": "activetype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/component-types",
        json={"name": "Archived Type", "slug": "archivedtype"},
        headers=auth_headers,
    )
    await client.delete(
        "/api/v1/component-types/archivedtype",
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/component-types?include_archived=true",
        headers=auth_headers,
    )
    slugs = [ct["slug"] for ct in response.json()]
    assert "activetype" in slugs
    assert "archivedtype" in slugs


@pytest.mark.asyncio
async def test_update_component_type(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Original Name", "slug": "originalslug", "description": ""},
        headers=auth_headers,
    )

    response = await client.put(
        "/api/v1/component-types/originalslug",
        json={"name": "Updated Name", "description": "New description."},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "New description."


@pytest.mark.asyncio
async def test_update_component_type_add_fields(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test Type", "slug": "testtype", "fields": []},
        headers=auth_headers,
    )

    response = await client.put(
        "/api/v1/component-types/testtype",
        json={
            "fields": [
                {"field_id": "new_field", "label": "New Field", "field_type": "text"}
            ]
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()["fields"]) == 1


@pytest.mark.asyncio
async def test_delete_component_type(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "To Archive", "slug": "toarchive"},
        headers=auth_headers,
    )

    response = await client.delete(
        "/api/v1/component-types/toarchive",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["is_archived"] is True


@pytest.mark.asyncio
async def test_delete_component_type_requires_admin(
    client: AsyncClient, member_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test Type", "slug": "testtype"},
        headers=member_headers,
    )

    response = await client.delete(
        "/api/v1/component-types/testtype",
        headers=member_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_cannot_delete_type_with_components(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Linked Type", "slug": "linkedtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "linkedtype", "status": "available"},
        headers=auth_headers,
    )

    response = await client.delete(
        "/api/v1/component-types/linkedtype",
        headers=auth_headers,
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_select_field_with_options(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/component-types",
        json={
            "name": "Test Select",
            "slug": "testselect",
            "fields": [
                {
                    "field_id": "status_field",
                    "label": "Status",
                    "field_type": "select",
                    "options": ["Active", "Inactive"],
                }
            ],
        },
        headers=auth_headers,
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_multiselect_field_with_options(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/component-types",
        json={
            "name": "Test Multi",
            "slug": "testmulti",
            "fields": [
                {
                    "field_id": "multi_field",
                    "label": "Multi",
                    "field_type": "multiselect",
                    "options": ["Option A", "Option B"],
                }
            ],
        },
        headers=auth_headers,
    )
    assert response.status_code == 201