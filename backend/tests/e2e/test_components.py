import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_component(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={
            "name": "Falcon 500",
            "slug": "falcon500",
            "fields": [
                {"field_id": "device_id", "label": "Device ID", "field_type": "number"}
            ],
        },
        headers=auth_headers,
    )

    response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "falcon500",
            "diagnostic_data": {"device_id": 5},
            "notes": "Test motor.",
            "status": "available",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["code"].startswith("falcon500-")
    assert data["status"] == "available"


@pytest.mark.asyncio
async def test_component_code_generation_sequential(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "NavX", "slug": "navx"},
        headers=auth_headers,
    )

    codes = []
    for _ in range(3):
        response = await client.post(
            "/api/v1/components",
            json={"component_type_slug": "navx", "status": "available"},
            headers=auth_headers,
        )
        codes.append(response.json()["code"])

    assert codes[0] != codes[1] != codes[2]
    assert all(code.startswith("navx-") for code in codes)
    assert "001" in codes[0]
    assert "002" in codes[1]
    assert "003" in codes[2]


@pytest.mark.asyncio
async def test_register_component_with_full_diagnostic_data(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={
            "name": "Falcon 500",
            "slug": "falcon500",
            "fields": [
                {"field_id": "device_id", "label": "CAN ID", "field_type": "number"},
                {"field_id": "firmware", "label": "Firmware", "field_type": "text"},
            ],
        },
        headers=auth_headers,
    )

    response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "falcon500",
            "diagnostic_data": {"device_id": 10, "firmware": "24.1.0"},
            "status": "available",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["diagnostic_data"]["device_id"] == 10


@pytest.mark.asyncio
async def test_register_component_invalid_type(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "nonexistent",
            "status": "available",
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_component(client: AsyncClient, auth_headers: dict):
    create_response = await client.post(
        "/api/v1/component-types",
        json={"name": "Test Type", "slug": "testtype"},
        headers=auth_headers,
    )
    comp_response = await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    code = comp_response.json()["code"]

    response = await client.get(
        f"/api/v1/components/{code}",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["code"] == code


@pytest.mark.asyncio
async def test_get_nonexistent_component(client: AsyncClient, auth_headers: dict):
    response = await client.get(
        "/api/v1/components/fake-2025-001",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_component_status(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={"status": "in_use"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "in_use"


@pytest.mark.asyncio
async def test_update_component_diagnostic_data(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={
            "name": "Test",
            "slug": "testtype",
            "fields": [{"field_id": "current", "label": "Current", "field_type": "number"}],
        },
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "diagnostic_data": {"current": 10},
            "status": "available",
        },
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={"diagnostic_data": {"current": 25}},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["diagnostic_data"]["current"] == 25


@pytest.mark.asyncio
async def test_update_component_notes(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "notes": "Initial notes.",
            "status": "available",
        },
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={"notes": "Updated notes."},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["notes"] == "Updated notes."


@pytest.mark.asyncio
async def test_update_component_to_loaned_with_loan_info(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={
            "status": "loaned",
            "loan_info": {
                "borrower_name": "Team 4414",
                "expected_return": "2025-04-01",
                "notes": "Borrowed for offseason.",
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "loaned"
    assert data["loan_info"]["borrower_name"] == "Team 4414"


@pytest.mark.asyncio
async def test_update_component_from_loaned_clears_loan_info(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "status": "loaned",
            "loan_info": {"borrower_name": "Team 123"},
        },
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={"status": "available"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["loan_info"] is None


@pytest.mark.asyncio
async def test_update_component_to_decommissioned(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    response = await client.patch(
        f"/api/v1/components/{code}",
        json={"status": "decommissioned"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "decommissioned"


@pytest.mark.asyncio
async def test_component_history_logged(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    create_response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "status": "available",
            "notes": "Initial notes.",
        },
        headers=auth_headers,
    )
    code = create_response.json()["code"]

    await client.patch(
        f"/api/v1/components/{code}",
        json={"status": "in_use", "notes": "Updated notes."},
        headers=auth_headers,
    )

    response = await client.get(
        f"/api/v1/components/{code}/history",
        headers=auth_headers,
    )
    assert response.status_code == 200
    history = response.json()
    assert len(history) >= 2


@pytest.mark.asyncio
async def test_diagnostic_data_unknown_field_rejected(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={
            "name": "Test",
            "slug": "testtype",
            "fields": [{"field_id": "current", "label": "Current", "field_type": "number"}],
        },
        headers=auth_headers,
    )

    response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "diagnostic_data": {"unknown_field": "value"},
            "status": "available",
        },
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_diagnostic_data_missing_required_field(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={
            "name": "Test",
            "slug": "testtype",
            "fields": [
                {"field_id": "required_field", "label": "Required", "field_type": "text", "required": True}
            ],
        },
        headers=auth_headers,
    )

    response = await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "diagnostic_data": {},
            "status": "available",
        },
        headers=auth_headers,
    )
    assert response.status_code == 422