import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_inventory_empty(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/inventory", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


@pytest.mark.asyncio
async def test_list_inventory(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Falcon 500", "slug": "falcon500"},
        headers=auth_headers,
    )
    for _ in range(5):
        await client.post(
            "/api/v1/components",
            json={"component_type_slug": "falcon500", "status": "available"},
            headers=auth_headers,
        )

    response = await client.get("/api/v1/inventory", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5
    assert data["total"] == 5
    assert data["page"] == 1


@pytest.mark.asyncio
async def test_inventory_pagination(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test Type", "slug": "testtype"},
        headers=auth_headers,
    )
    for _ in range(25):
        await client.post(
            "/api/v1/components",
            json={"component_type_slug": "testtype", "status": "available"},
            headers=auth_headers,
        )

    response = await client.get(
        "/api/v1/inventory?page=2&page_size=10",
        headers=auth_headers,
    )
    data = response.json()
    assert len(data["items"]) == 10
    assert data["page"] == 2
    assert data["total"] == 25


@pytest.mark.asyncio
async def test_inventory_filter_by_type_slug(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Type A", "slug": "typea"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/component-types",
        json={"name": "Type B", "slug": "typeb"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "typea", "status": "available"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "typeb", "status": "available"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?type_slug=typea",
        headers=auth_headers,
    )
    data = response.json()
    assert all(item["component_type"] == "Type A" for item in data["items"])
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_inventory_filter_by_status(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "in_use"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?status=available",
        headers=auth_headers,
    )
    data = response.json()
    assert all(item["status"] == "available" for item in data["items"])


@pytest.mark.asyncio
async def test_inventory_search_by_notes(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "status": "available",
            "notes": "Left drivetrain motor.",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "status": "available",
            "notes": "Right motor.",
        },
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?q=drivetrain",
        headers=auth_headers,
    )
    data = response.json()
    assert data["total"] == 1
    assert "drivetrain" in data["items"][0]["notes"]


@pytest.mark.asyncio
async def test_inventory_search_by_code(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?q=testtype",
        headers=auth_headers,
    )
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["code"].startswith("testtype-")


@pytest.mark.asyncio
async def test_inventory_sort_by_created_at_desc(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?sort_by=created_at&sort_dir=desc",
        headers=auth_headers,
    )
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 2


@pytest.mark.asyncio
async def test_inventory_sort_by_status(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "in_use"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?sort_by=status&sort_dir=asc",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_inventory_includes_decommissioned_by_default(
    client: AsyncClient, auth_headers: dict
):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "available"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={"component_type_slug": "testtype", "status": "decommissioned"},
        headers=auth_headers,
    )

    response = await client.get("/api/v1/inventory", headers=auth_headers)
    data = response.json()
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_inventory_page_size_max_limit(client: AsyncClient, auth_headers: dict):
    response = await client.get(
        "/api/v1/inventory?page_size=200",
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_inventory_combined_filters(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/component-types",
        json={"name": "Test", "slug": "testtype"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/components",
        json={
            "component_type_slug": "testtype",
            "status": "in_use",
            "notes": "Important component.",
        },
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/inventory?type_slug=testtype&status=in_use&q=Important",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == "in_use"