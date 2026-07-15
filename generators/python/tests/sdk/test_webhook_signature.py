import base64
import hashlib
import hmac
import typing

from core_utilities.shared.webhook_signature import (
    compute_hash,
    compute_hmac_signature,
    get_webhook_query_parameter,
    timing_safe_equal,
)


def test_compute_hash_sha256_hex() -> None:
    payload = '{"messageSid":"SM123","status":"delivered"}'
    expected = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    assert compute_hash(payload=payload, algorithm="sha256", encoding="hex") == expected


def test_compute_hash_sha1_base64() -> None:
    payload = "hello world"
    expected = base64.b64encode(hashlib.sha1(payload.encode("utf-8")).digest()).decode("utf-8")
    assert compute_hash(payload=payload, algorithm="sha1", encoding="base64") == expected


def test_compute_hash_is_unkeyed_and_differs_from_hmac() -> None:
    payload = "payload"
    assert compute_hash(payload=payload, algorithm="sha256", encoding="hex") != compute_hmac_signature(
        payload=payload, secret="secret", algorithm="sha256", encoding="hex"
    )


def test_get_webhook_query_parameter_present() -> None:
    url = "https://example.com/webhook?bodySHA256=abc123&foo=bar"
    assert get_webhook_query_parameter(url, "bodySHA256") == "abc123"


def test_get_webhook_query_parameter_missing() -> None:
    url = "https://example.com/webhook?foo=bar"
    assert get_webhook_query_parameter(url, "bodySHA256") is None


def test_get_webhook_query_parameter_no_query() -> None:
    url = "https://example.com/webhook"
    assert get_webhook_query_parameter(url, "bodySHA256") is None


def test_get_webhook_query_parameter_returns_first_value() -> None:
    url = "https://example.com/webhook?bodySHA256=first&bodySHA256=second"
    assert get_webhook_query_parameter(url, "bodySHA256") == "first"


def test_get_webhook_query_parameter_preserves_url_when_reading() -> None:
    url = "https://example.com/webhook?z=1&a=2&bodySHA256=hash"
    _ = get_webhook_query_parameter(url, "bodySHA256")
    # Reading must not mutate/reorder the caller's URL string.
    assert url == "https://example.com/webhook?z=1&a=2&bodySHA256=hash"


# --- Runtime mock test mirroring the generated SmsStatusWebhooksHelper.verify_signature ---

_SECRET = "twilio_secret"
_BODY = '{"messageSid":"SM123","status":"delivered"}'


def _sign(notification_url: str, secret: str = _SECRET) -> str:
    return base64.b64encode(
        hmac.new(secret.encode("utf-8"), notification_url.encode("utf-8"), hashlib.sha1).digest()
    ).decode("utf-8")


def _notification_url(body: str = _BODY, *, query_hash: typing.Optional[str] = None) -> str:
    body_hash = query_hash if query_hash is not None else hashlib.sha256(body.encode("utf-8")).hexdigest()
    return f"https://example.com/sms/status?MessageStatus=delivered&bodySHA256={body_hash}"


def _verify(*, request_body: str, signature_header: str, signature_key: str, notification_url: str) -> bool:
    """Mirror of the generated helper's two-step body-hash-binding verification."""
    if request_body is None or signature_header is None or signature_key is None:
        raise ValueError("Missing required parameters for webhook signature verification")

    expected_body_hash = compute_hash(payload=request_body, algorithm="sha256", encoding="hex")
    transmitted_body_hash = get_webhook_query_parameter(notification_url, "bodySHA256")
    if transmitted_body_hash is None or not timing_safe_equal(expected_body_hash, transmitted_body_hash):
        return False

    payload = "".join([notification_url])
    expected = compute_hmac_signature(payload=payload, secret=signature_key, algorithm="sha1", encoding="base64")
    return timing_safe_equal(signature_header, expected)


def test_verify_valid_signature_returns_true() -> None:
    url = _notification_url()
    assert _verify(
        request_body=_BODY,
        signature_header=_sign(url),
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_tampered_raw_body_returns_false() -> None:
    url = _notification_url()
    assert not _verify(
        request_body='{"messageSid":"SM123","status":"failed"}',
        signature_header=_sign(url),
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_tampered_query_hash_returns_false() -> None:
    url = _notification_url(query_hash="deadbeef")
    assert not _verify(
        request_body=_BODY,
        signature_header=_sign(url),
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_missing_query_hash_returns_false() -> None:
    url = "https://example.com/sms/status?MessageStatus=delivered"
    assert not _verify(
        request_body=_BODY,
        signature_header=_sign(url),
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_tampered_hmac_signature_returns_false() -> None:
    url = _notification_url()
    assert not _verify(
        request_body=_BODY,
        signature_header="not-the-real-signature",
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_wrong_secret_returns_false() -> None:
    url = _notification_url()
    assert not _verify(
        request_body=_BODY,
        signature_header=_sign(url, secret="wrong_secret"),
        signature_key=_SECRET,
        notification_url=url,
    )


def test_verify_signs_notification_url_verbatim() -> None:
    # The outer HMAC signs the URL exactly as transmitted; a reordered URL (even if
    # semantically equivalent) must not verify, proving we never normalize the query string.
    url = _notification_url()
    reordered = "https://example.com/sms/status?bodySHA256={}&MessageStatus=delivered".format(
        hashlib.sha256(_BODY.encode("utf-8")).hexdigest()
    )
    signature = _sign(url)
    assert _verify(request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url)
    assert not _verify(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=reordered
    )
