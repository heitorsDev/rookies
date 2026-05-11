import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import mongomock
from mongoengine import connect, disconnect

os.environ.setdefault("ENV_FILE", ".env.test")

from dotenv import load_dotenv

load_dotenv(".env.test")


@pytest.fixture(scope="function")
async def client() -> "AsyncClient":
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    connect(
        "rookies_test",
        mongo_client_class=mongomock.MongoClient,
    )
    transport = ASGITransport(app=app)
    client_instance = AsyncClient(transport=transport, base_url="http://test")

    yield client_instance

    await client_instance.aclose()
    disconnect()


@pytest.fixture(scope="function")
async def admin_token(client: "AsyncClient") -> str:
    response = await client.post(
        "/api/v1/auth/seed",
        json={"name": "Test Admin", "username": "testadmin", "role": "admin", "seed_key": "test-seed-key"},
    )
    assert response.status_code == 200, f"Seed failed: {response.text}"
    token = response.json()["token"]

    activate_response = await client.post(
        "/api/v1/auth/activate",
        json={"username": "testadmin", "token": token, "password": "TestPass123!"},
    )
    assert activate_response.status_code == 200, f"Activate failed: {activate_response.text}"

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "TestPass123!"},
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    return login_response.json()["access_token"]


@pytest.fixture(scope="function")
async def member_token(client: "AsyncClient", admin_token: str) -> str:
    response = await client.post(
        "/api/v1/auth/members",
        json={"name": "Test Member", "username": "testmember", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201, f"Create member failed: {response.text}"
    token = response.json()["token"]

    activate_response = await client.post(
        "/api/v1/auth/activate",
        json={"username": "testmember", "token": token, "password": "MemberPass123!"},
    )
    assert activate_response.status_code == 200, f"Activate failed: {activate_response.text}"

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testmember", "password": "MemberPass123!"},
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    return login_response.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def member_headers(member_token: str) -> dict:
    return {"Authorization": f"Bearer {member_token}"}