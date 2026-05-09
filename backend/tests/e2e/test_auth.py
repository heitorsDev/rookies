import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_seed_first_admin(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/seed",
        params={"seed_key": "test-seed-key"},
        json={"name": "Admin User", "username": "admin"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
    assert "token" in data


@pytest.mark.asyncio
async def test_seed_fails_with_invalid_key(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/seed",
        params={"seed_key": "wrong-key"},
        json={"name": "Admin", "username": "admin"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_seed_fails_when_members_exist(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/auth/seed",
        params={"seed_key": "test-seed-key"},
        json={"name": "Another Admin", "username": "anotheradmin"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_activate_account(client: AsyncClient):
    seed_response = await client.post(
        "/api/v1/auth/seed",
        params={"seed_key": "test-seed-key"},
        json={"name": "New User", "username": "newuser"},
    )
    token = seed_response.json()["token"]

    activate_response = await client.post(
        "/api/v1/auth/activate",
        json={"username": "newuser", "token": token, "password": "SecurePass123!"},
    )
    assert activate_response.status_code == 200
    assert "activated" in activate_response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_activate_with_invalid_token(client: AsyncClient):
    await client.post(
        "/api/v1/auth/seed",
        params={"seed_key": "test-seed-key"},
        json={"name": "User", "username": "user1"},
    )

    response = await client.post(
        "/api/v1/auth/activate",
        json={"username": "user1", "token": "invalid-token", "password": "Pass123!"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_activate_already_activated_account(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/auth/activate",
        json={"username": "testadmin", "token": "any-token", "password": "Pass123!"},
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "TestPass123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["member"]["username"] == "testadmin"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "anypassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_without_token(client: AsyncClient):
    response = await client.get("/api/v1/component-types")
    assert response.status_code == 401 or response.status_code == 403


@pytest.mark.asyncio
async def test_protected_route_with_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/component-types",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401 or response.status_code == 403


@pytest.mark.asyncio
async def test_create_member_as_admin(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/auth/members",
        json={"name": "New Member", "username": "newmember", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newmember"
    assert "token" in data


@pytest.mark.asyncio
async def test_create_member_as_non_admin(client: AsyncClient, member_token: str):
    response = await client.post(
        "/api/v1/auth/members",
        json={"name": "Another Member", "username": "anothermember", "role": "member"},
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_members_as_admin(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/v1/auth/members",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(m["username"] == "testadmin" for m in data)


@pytest.mark.asyncio
async def test_list_members_as_non_admin(client: AsyncClient, member_token: str):
    response = await client.get(
        "/api/v1/auth/members",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_generate_token_for_member(client: AsyncClient, admin_token: str):
    create_response = await client.post(
        "/api/v1/auth/members",
        json={"name": "Token Test", "username": "tokentest", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create_response.status_code == 201

    token_response = await client.post(
        "/api/v1/auth/tokens?username=tokentest",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert token_response.status_code == 200
    assert "token" in token_response.json()


@pytest.mark.asyncio
async def test_duplicate_username_rejected(client: AsyncClient, admin_token: str):
    await client.post(
        "/api/v1/auth/members",
        json={"name": "First", "username": "duplicate", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    response = await client.post(
        "/api/v1/auth/members",
        json={"name": "Second", "username": "duplicate", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 409