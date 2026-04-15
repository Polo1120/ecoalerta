"""
tests/test_users.py
────────────────────
Tests for /users/me endpoint.
"""

from fastapi.testclient import TestClient

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/users/me"


def _register_and_login(client: TestClient, suffix: str = "1") -> dict:
    payload = {
        "name": f"Test User {suffix}",
        "email": f"me{suffix}@ecoalerta.com",
        "password": f"password{suffix}1",
    }
    client.post(REGISTER_URL, json=payload)
    resp = client.post(LOGIN_URL, json={"email": payload["email"], "password": payload["password"]})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, payload


def test_get_me_authenticated(client: TestClient):
    headers, payload = _register_and_login(client, "me1")
    resp = client.get(ME_URL, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]
    assert "hashed_password" not in data


def test_get_me_unauthenticated(client: TestClient):
    resp = client.get(ME_URL)
    assert resp.status_code == 403


def test_get_me_invalid_token(client: TestClient):
    resp = client.get(ME_URL, headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401
