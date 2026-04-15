"""
tests/test_reports.py
──────────────────────
Integration tests for /reports endpoints.
"""

from fastapi.testclient import TestClient

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
REPORTS_URL = "/api/v1/reports"

SAMPLE_REPORT = {
    "title": "Basura en el parque central",
    "description": "Llevan más de 3 días sin recoger la basura acumulada.",
    "latitude": 7.0728,
    "longitude": -73.1126,
    "image_url": "https://cdn.example.com/foto1.jpg",
}


def _auth_header(client: TestClient, email: str, password: str, name: str = "Test") -> dict:
    client.post(REGISTER_URL, json={"name": name, "email": email, "password": password})
    resp = client.post(LOGIN_URL, json={"email": email, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_report_authenticated(client: TestClient):
    headers = _auth_header(client, "user@eco.com", "password1", "User One")
    resp = client.post(REPORTS_URL, json=SAMPLE_REPORT, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == SAMPLE_REPORT["title"]
    assert data["status"] == "pending"


def test_create_report_unauthenticated(client: TestClient):
    resp = client.post(REPORTS_URL, json=SAMPLE_REPORT)
    assert resp.status_code == 403


def test_list_reports(client: TestClient):
    headers = _auth_header(client, "lister@eco.com", "password2", "Lister")
    client.post(REPORTS_URL, json=SAMPLE_REPORT, headers=headers)
    resp = client.get(REPORTS_URL, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert data["total"] >= 1


def test_list_reports_pagination(client: TestClient):
    headers = _auth_header(client, "pager@eco.com", "password3", "Pager")
    for i in range(3):
        client.post(REPORTS_URL, json={**SAMPLE_REPORT, "title": f"Report {i}"}, headers=headers)
    resp = client.get(f"{REPORTS_URL}?page=1&page_size=2", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["results"]) <= 2


def test_get_report_detail(client: TestClient):
    headers = _auth_header(client, "detail@eco.com", "password4", "Detail")
    created = client.post(REPORTS_URL, json=SAMPLE_REPORT, headers=headers).json()
    resp = client.get(f"{REPORTS_URL}/{created['id']}", headers=headers)
    assert resp.status_code == 200
    assert "author" in resp.json()


def test_get_report_not_found(client: TestClient):
    headers = _auth_header(client, "notfound@eco.com", "password5", "NF")
    resp = client.get(f"{REPORTS_URL}/99999", headers=headers)
    assert resp.status_code == 404


def test_update_status_requires_admin(client: TestClient):
    headers = _auth_header(client, "nonadmin@eco.com", "password6", "NonAdmin")
    created = client.post(REPORTS_URL, json=SAMPLE_REPORT, headers=headers).json()
    resp = client.put(
        f"{REPORTS_URL}/{created['id']}/status",
        json={"status": "in_progress"},
        headers=headers,
    )
    assert resp.status_code == 403
