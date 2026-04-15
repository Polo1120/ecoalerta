"""
tests/test_auth.py
───────────────────
Unit tests for /auth/register and /auth/login endpoints.
"""

import pytest
from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"

VALID_USER = {
    "name": "Test User",
    "email": "test@ecoalerta.com",
    "password": "secure123",
}


def test_register_success(client: TestClient):
    resp = client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == VALID_USER["email"]
    assert data["role"] == "user"
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient):
    client.post(REGISTER_URL, json=VALID_USER)
    resp = client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 409


def test_register_weak_password(client: TestClient):
    payload = {**VALID_USER, "email": "other@test.com", "password": "nodigits"}
    resp = client.post(REGISTER_URL, json=payload)
    assert resp.status_code == 422


def test_login_success(client: TestClient):
    client.post(REGISTER_URL, json=VALID_USER)
    resp = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient):
    client.post(REGISTER_URL, json=VALID_USER)
    resp = client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": "wrongpass1"})
    assert resp.status_code == 401


def test_login_unknown_email(client: TestClient):
    resp = client.post(LOGIN_URL, json={"email": "nobody@test.com", "password": "whatever1"})
    assert resp.status_code == 401
