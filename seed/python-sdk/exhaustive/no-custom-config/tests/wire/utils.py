from pytest import pytest
from requests import requests
from typing import Any

@pytest.fixture
def wiremock_base_url() -> str:
    return "http://localhost:8080"


@pytest.fixture
def client(wiremock_base_url: str) -> Any:
    # TODO: Generate actual client instantiation based on SDK
    # This is a placeholder - will be updated when client construction is available
    import importlib
    # Dynamic client creation would go here
    return None  # Placeholder


def reset_wiremock_requests():
    wiremock_admin_url = "http://localhost:8080/__admin"
    response = requests.post(f"{wiremock_admin_url}/requests/reset")
    assert response.status_code == 200


def verify_request_count(method: str, url_path: str, expected: int):
    wiremock_admin_url = "http://localhost:8080/__admin"
    req_body = {"method": method, "urlPath": url_path}
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=req_body)
    assert response.status_code == 200
    result = response.json()
    actual_count = len(result.get("requests", []))
    assert actual_count == expected, f"Expected {expected} requests, got {actual_count}"

