import hashlib
import time
from unittest.mock import patch

import httpx
import jwt as jwt_lib
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from core_utilities.shared.pkcv import (
    PKCV_JWT_ALGORITHM,
    PKCV_JWT_CTY,
    PKCV_JWT_TTL,
    PKCV_SIGNED_HEADERS,
    PKCV_VALIDATION_HEADER,
    AsyncPKCVTransport,
    PKCVTransport,
    _build_canonical_request,
    _create_pkcv_jwt,
    _sha256_hash,
    _sign_request,
    _sort_and_join,
)


def _generate_rsa_private_key() -> str:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")


ACCOUNT_SID = "AC00000000000000000000000000000000"
API_KEY_SID = "SK1234567890abcdef1234567890abcdef"
CREDENTIAL_SID = "CR1234567890abcdef1234567890abcdef"


class TestSha256Hash:
    def test_hashes_string(self) -> None:
        result = _sha256_hash("hello")
        assert result == hashlib.sha256(b"hello").hexdigest()

    def test_hashes_bytes(self) -> None:
        result = _sha256_hash(b"hello")
        assert result == hashlib.sha256(b"hello").hexdigest()

    def test_empty_string_returns_empty(self) -> None:
        assert _sha256_hash("") == ""

    def test_empty_bytes_returns_empty(self) -> None:
        assert _sha256_hash(b"") == ""


class TestSortAndJoin:
    def test_string_passthrough(self) -> None:
        assert _sort_and_join("already-a-string", ",") == "already-a-string"

    def test_sorts_and_joins_list(self) -> None:
        assert _sort_and_join(["c", "a", "b"], ",") == "a,b,c"

    def test_single_element_list(self) -> None:
        assert _sort_and_join(["only"], "&") == "only"

    def test_empty_list(self) -> None:
        assert _sort_and_join([], ",") == ""


class TestBuildCanonicalRequest:
    def test_twilio_quickstart_example(self) -> None:
        """Verify against the Twilio PKCV quickstart example.

        Reference: https://www.twilio.com/docs/iam/pkcv/quickstart#final-canonical-request
        """
        method = "POST"
        path = "/2010-04-01/Accounts/AC00000000000000000000000000000000"
        query_string = ""
        headers = {
            "Host": "api.twilio.com",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "Content-Length": "33",
            "Authorization": "Basic QUMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDpmb29iYXI=",
        }
        body = "FriendlyName=mynewfriendly name"

        canonical = _build_canonical_request(method, path, query_string, headers, body)
        body_hash = _sha256_hash(body)

        expected_parts = [
            "POST",
            "/2010-04-01/Accounts/AC00000000000000000000000000000000",
            "",
            "authorization:Basic QUMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDpmb29iYXI=",
            "host:api.twilio.com",
            "",
            "authorization;host",
            body_hash,
        ]
        assert canonical == "\n".join(expected_parts)

    def test_query_string_sorting(self) -> None:
        canonical = _build_canonical_request(
            method="GET",
            path="/resource",
            query_string="to=4157654321&from=4151234567&message=Hello",
            headers={
                "Host": "api.twilio.com",
                "Authorization": "Basic abc123",
            },
            body="",
        )
        lines = canonical.split("\n")
        assert lines[0] == "GET"
        assert lines[1] == "/resource"
        assert lines[2] == "from=4151234567&message=Hello&to=4157654321"

    def test_empty_body(self) -> None:
        canonical = _build_canonical_request(
            method="GET",
            path="/resource",
            query_string="",
            headers={"Host": "api.twilio.com", "Authorization": "Basic abc"},
            body="",
        )
        lines = canonical.split("\n")
        assert lines[-1] == ""

    def test_only_signed_headers_included(self) -> None:
        canonical = _build_canonical_request(
            method="GET",
            path="/test",
            query_string="",
            headers={
                "Host": "api.twilio.com",
                "Authorization": "Basic abc",
                "Content-Type": "application/json",
                "X-Custom-Header": "should-not-appear",
            },
            body="",
        )
        assert "Content-Type" not in canonical
        assert "X-Custom-Header" not in canonical
        assert "authorization:" in canonical
        assert "host:" in canonical

    def test_headers_lowercased(self) -> None:
        canonical = _build_canonical_request(
            method="GET",
            path="/test",
            query_string="",
            headers={"HOST": "API.TWILIO.COM", "AUTHORIZATION": "Basic ABC"},
            body="test",
        )
        assert "host:API.TWILIO.COM" in canonical
        assert "authorization:Basic ABC" in canonical


class TestCreatePkcvJwt:
    def test_jwt_structure(self) -> None:
        private_key = _generate_rsa_private_key()
        token = _create_pkcv_jwt(
            account_sid=ACCOUNT_SID,
            api_key_sid=API_KEY_SID,
            credential_sid=CREDENTIAL_SID,
            private_key=private_key,
            method="POST",
            path="/test",
            query_string="",
            headers={"Host": "api.twilio.com", "Authorization": "Basic abc"},
            body="test body",
        )

        decoded_headers = jwt_lib.get_unverified_header(token)
        assert decoded_headers["alg"] == PKCV_JWT_ALGORITHM
        assert decoded_headers["cty"] == PKCV_JWT_CTY
        assert decoded_headers["kid"] == CREDENTIAL_SID
        assert decoded_headers["typ"] == "JWT"

    def test_jwt_payload_claims(self) -> None:
        private_key = _generate_rsa_private_key()
        frozen_time = 1700000000

        with patch("core_utilities.shared.pkcv.time") as mock_time:
            mock_time.time.return_value = frozen_time
            token = _create_pkcv_jwt(
                account_sid=ACCOUNT_SID,
                api_key_sid=API_KEY_SID,
                credential_sid=CREDENTIAL_SID,
                private_key=private_key,
                method="GET",
                path="/test",
                query_string="",
                headers={"Host": "api.twilio.com", "Authorization": "Basic abc"},
                body="",
            )

        payload = jwt_lib.decode(token, options={"verify_signature": False}, algorithms=[PKCV_JWT_ALGORITHM])
        assert payload["iss"] == API_KEY_SID
        assert payload["sub"] == ACCOUNT_SID
        assert payload["exp"] == frozen_time + PKCV_JWT_TTL
        assert payload["nbf"] == frozen_time
        assert payload["hrh"] == "authorization;host"
        assert isinstance(payload["rqh"], str)
        assert len(payload["rqh"]) == 64

    def test_jwt_rqh_matches_canonical_hash(self) -> None:
        private_key = _generate_rsa_private_key()
        method = "POST"
        path = "/2010-04-01/Accounts/AC00000000000000000000000000000000"
        query_string = ""
        headers = {
            "Host": "api.twilio.com",
            "Authorization": "Basic QUMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDpmb29iYXI=",
        }
        body = "FriendlyName=mynewfriendly name"

        token = _create_pkcv_jwt(
            account_sid=ACCOUNT_SID,
            api_key_sid=API_KEY_SID,
            credential_sid=CREDENTIAL_SID,
            private_key=private_key,
            method=method,
            path=path,
            query_string=query_string,
            headers=headers,
            body=body,
        )

        canonical = _build_canonical_request(method, path, query_string, headers, body)
        expected_rqh = _sha256_hash(canonical)

        payload = jwt_lib.decode(token, options={"verify_signature": False}, algorithms=[PKCV_JWT_ALGORITHM])
        assert payload["rqh"] == expected_rqh


class TestSignRequest:
    def test_adds_validation_header(self) -> None:
        private_key = _generate_rsa_private_key()
        request = httpx.Request(
            method="POST",
            url="https://api.twilio.com/2010-04-01/Accounts/AC000",
            headers={
                "Authorization": "Basic abc123",
                "Content-Type": "application/json",
            },
            content=b'{"hello": "world"}',
        )

        _sign_request(request, ACCOUNT_SID, API_KEY_SID, CREDENTIAL_SID, private_key)
        assert PKCV_VALIDATION_HEADER in request.headers

        token = request.headers[PKCV_VALIDATION_HEADER]
        decoded = jwt_lib.decode(token, options={"verify_signature": False}, algorithms=[PKCV_JWT_ALGORITHM])
        assert decoded["iss"] == API_KEY_SID
        assert decoded["sub"] == ACCOUNT_SID

    def test_injects_host_header_if_missing(self) -> None:
        private_key = _generate_rsa_private_key()
        request = httpx.Request(
            method="GET",
            url="https://api.twilio.com/test",
            headers={"Authorization": "Basic abc"},
        )

        _sign_request(request, ACCOUNT_SID, API_KEY_SID, CREDENTIAL_SID, private_key)
        assert "host" in {k.lower() for k in request.headers.keys()}

    def test_preserves_existing_host_header(self) -> None:
        private_key = _generate_rsa_private_key()
        request = httpx.Request(
            method="GET",
            url="https://api.twilio.com/test",
            headers={"Authorization": "Basic abc", "Host": "custom.host.com"},
        )

        _sign_request(request, ACCOUNT_SID, API_KEY_SID, CREDENTIAL_SID, private_key)
        host_values = [v for k, v in request.headers.items() if k.lower() == "host"]
        assert len(host_values) == 1
        assert host_values[0] == "custom.host.com"


class TestPKCVTransport:
    def test_signs_and_forwards_request(self) -> None:
        private_key = _generate_rsa_private_key()
        inner_response = httpx.Response(200, text="ok")

        class StubTransport(httpx.BaseTransport):
            def __init__(self) -> None:
                self.last_request: httpx.Request = None  # type: ignore[assignment]

            def handle_request(self, request: httpx.Request) -> httpx.Response:
                self.last_request = request
                return inner_response

        stub = StubTransport()
        transport = PKCVTransport(
            transport=stub,
            account_sid=ACCOUNT_SID,
            api_key_sid=API_KEY_SID,
            credential_sid=CREDENTIAL_SID,
            private_key=private_key,
        )

        request = httpx.Request(
            method="GET",
            url="https://api.twilio.com/test",
            headers={"Authorization": "Basic abc"},
        )
        response = transport.handle_request(request)

        assert response.status_code == 200
        assert stub.last_request is not None
        assert PKCV_VALIDATION_HEADER in stub.last_request.headers


@pytest.mark.asyncio
async def test_async_pkcv_transport_signs_and_forwards() -> None:
    private_key = _generate_rsa_private_key()
    inner_response = httpx.Response(200, text="ok")

    class StubAsyncTransport(httpx.AsyncBaseTransport):
        def __init__(self) -> None:
            self.last_request: httpx.Request = None  # type: ignore[assignment]

        async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
            self.last_request = request
            return inner_response

    stub = StubAsyncTransport()
    transport = AsyncPKCVTransport(
        transport=stub,
        account_sid=ACCOUNT_SID,
        api_key_sid=API_KEY_SID,
        credential_sid=CREDENTIAL_SID,
        private_key=private_key,
    )

    request = httpx.Request(
        method="POST",
        url="https://api.twilio.com/test",
        headers={"Authorization": "Basic abc"},
        content=b"body",
    )
    response = await transport.handle_async_request(request)

    assert response.status_code == 200
    assert stub.last_request is not None
    assert PKCV_VALIDATION_HEADER in stub.last_request.headers
