import pytest


def test_health_endpoint(api_client):
    response = api_client.health()
    assert response.status == 200
    data = response.json()
    assert data["status"] == "ok"


def test_health_no_auth_required(api_client):
    response = api_client.health()
    assert response.status == 200