@pytest.fixture(autouse=True)
def setup_client() -> None:
    """Reset WireMock before each test"""
    reset_wiremock_requests()


def reset_wiremock_requests() -> None:
    """Resets all WireMock request journal"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    response = requests.delete(f"{wiremock_admin_url}/requests")
    assert response.status_code == 200, "Failed to reset WireMock requests"


def verify_request_count(
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body = {"method": method, "urlPath": url_path}
    if query_params:
            query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
            request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_string() -> None:
    """Test getAndReturnString endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_string()
    verify_request_count("POST", "/primitive/string", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_int() -> None:
    """Test getAndReturnInt endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_int()
    verify_request_count("POST", "/primitive/integer", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_long() -> None:
    """Test getAndReturnLong endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_long()
    verify_request_count("POST", "/primitive/long", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_double() -> None:
    """Test getAndReturnDouble endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_double()
    verify_request_count("POST", "/primitive/double", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_bool() -> None:
    """Test getAndReturnBool endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_bool()
    verify_request_count("POST", "/primitive/boolean", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_datetime() -> None:
    """Test getAndReturnDatetime endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_datetime()
    verify_request_count("POST", "/primitive/datetime", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_date() -> None:
    """Test getAndReturnDate endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_date()
    verify_request_count("POST", "/primitive/date", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_uuid() -> None:
    """Test getAndReturnUUID endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_uuid()
    verify_request_count("POST", "/primitive/uuid", None, 1)


@pytest.mark.asyncio
def test_endpoints_primitive_get_and_return_base_64() -> None:
    """Test getAndReturnBase64 endpoint with WireMock"""
    client = seed_exhaustive(base_url="http://localhost:8080")
    result = client.get_and_return_base_64()
    verify_request_count("POST", "/primitive/base64", None, 1)

