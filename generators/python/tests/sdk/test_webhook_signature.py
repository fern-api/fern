import base64
import hashlib
import hmac
import typing

from core_utilities.shared.webhook_signature import (
    compute_hash,
    compute_hmac_signature,
    get_webhook_query_parameter,
    notification_url_candidates,
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


# --- notification_url_candidates utility (behavior 4) ---


def test_candidates_includes_url_as_is_first() -> None:
    url = "https://example.com/sms?a=1"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=True)
    assert candidates[0] == url


def test_candidates_adds_standard_and_no_port_https() -> None:
    url = "https://example.com/sms?a=1"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=False)
    assert candidates == [
        "https://example.com/sms?a=1",
        "https://example.com:443/sms?a=1",
    ]


def test_candidates_adds_standard_port_http() -> None:
    url = "http://example.com/sms?a=1"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=False)
    assert candidates == [
        "http://example.com/sms?a=1",
        "http://example.com:80/sms?a=1",
    ]


def test_candidates_removes_existing_standard_port() -> None:
    url = "https://example.com:443/sms?a=1"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=False)
    assert candidates == [
        "https://example.com:443/sms?a=1",
        "https://example.com/sms?a=1",
    ]


def test_candidates_dedupes_preserving_order() -> None:
    # A query-less URL collapses the legacy-query variants back onto the port forms.
    url = "https://example.com/sms"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=True)
    assert candidates == [
        "https://example.com/sms",
        "https://example.com:443/sms",
    ]


def test_candidates_legacy_query_encoding_variants() -> None:
    url = "https://example.com/sms?a=b%20c&d=e+f"
    candidates = notification_url_candidates(url, port_variants=True, legacy_query_encoding=True)
    assert candidates == [
        "https://example.com/sms?a=b%20c&d=e+f",
        "https://example.com:443/sms?a=b%20c&d=e+f",
        "https://example.com/sms?a=b+c&d=e+f",
        "https://example.com:443/sms?a=b+c&d=e+f",
    ]


def test_candidates_no_port_variants_returns_url_only() -> None:
    url = "https://example.com/sms?a=1"
    assert notification_url_candidates(url, port_variants=False, legacy_query_encoding=False) == [url]


def test_candidates_unparseable_url_returns_url_only() -> None:
    url = "https://example.com:notaport/sms"
    assert notification_url_candidates(url, port_variants=True, legacy_query_encoding=True) == [url]


# --- Generated helper rendering + runtime (behaviors 1-4) ---


def _render_helper(class_name: str, config: typing.Any) -> typing.Any:
    """Render the generated verify_signature helper and load it as an executable module."""
    import types

    from core_utilities.shared import webhook_signature as core
    from fern_python.generators.sdk.webhooks_helper_generator import _HmacHelperWriter

    source = _HmacHelperWriter(class_name=class_name, config=config).write()
    source = source.replace("from ..core.webhook_signature", "from core_utilities.shared.webhook_signature")
    module = types.ModuleType("_generated_webhook_helper")
    module.__dict__["core"] = core
    exec(compile(source, "generated_webhook_helper.py", "exec"), module.__dict__)  # noqa: S102
    return getattr(module, class_name)


def _hmac_config(**overrides: typing.Any) -> typing.Any:
    import fern.ir.resources as ir_types

    base = {
        "signatureHeaderName": {
            "name": {
                "originalName": "x-twilio-signature",
                "camelCase": {"unsafeName": "xTwilioSignature", "safeName": "xTwilioSignature"},
                "snakeCase": {"unsafeName": "x_twilio_signature", "safeName": "x_twilio_signature"},
                "screamingSnakeCase": {"unsafeName": "X_TWILIO_SIGNATURE", "safeName": "X_TWILIO_SIGNATURE"},
                "pascalCase": {"unsafeName": "XTwilioSignature", "safeName": "XTwilioSignature"},
            },
            "wireValue": "x-twilio-signature",
        },
        "algorithm": "SHA1",
        "encoding": "BASE64",
        "payloadFormat": {"components": ["NOTIFICATION_URL", "BODY"], "delimiter": ""},
    }
    base.update(overrides)
    return ir_types.HmacSignatureVerification.model_validate(base)


_BODY_SORT_FORMAT = {"components": ["NOTIFICATION_URL", "BODY"], "delimiter": "", "bodySort": "ALPHABETICAL"}
_BODY_HASH_BINDING = {
    "algorithm": "SHA256",
    "encoding": "HEX",
    "location": {"type": "queryParameter", "name": "bodySHA256"},
}
_URL_NORMALIZATION = {"portVariants": True, "legacyQueryEncoding": True}


def _form_body_string(params: typing.Dict[str, typing.Union[str, typing.List[str]]]) -> str:
    return "".join(
        "".join(
            key + value for value in sorted(set([params[key]] if isinstance(params[key], str) else list(params[key])))
        )
        for key in sorted(params)
    )


def test_generated_body_sort_single_value() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(payloadFormat=_BODY_SORT_FORMAT))
    url = "https://example.com/sms"
    params = {"To": "+15551112222", "From": "+15559998888"}
    payload = url + _form_body_string(params)
    signature = _sign(payload)
    assert helper.verify_signature(
        request_body=params, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_sort_repeated_keys_and_values_dedup_and_sort() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(payloadFormat=_BODY_SORT_FORMAT))
    url = "https://example.com/sms"
    # Repeated values are deduped; multiple values are sorted independently of the keys.
    params = {"Media": ["b", "a", "a"], "Status": "ok"}
    payload = url + _form_body_string(params)
    signature = _sign(payload)
    assert helper.verify_signature(
        request_body=params, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_sort_raw_string_passthrough() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(payloadFormat=_BODY_SORT_FORMAT))
    url = "https://example.com/sms"
    raw = "raw-body-unchanged"
    signature = _sign(url + raw)
    assert helper.verify_signature(
        request_body=raw, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_hash_json_path_valid() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(bodyHashBinding=_BODY_HASH_BINDING))
    body_hash = hashlib.sha256(_BODY.encode("utf-8")).hexdigest()
    url = f"https://example.com/sms?bodySHA256={body_hash}"
    signature = _sign(url)  # JSON path signs the URL only
    assert helper.verify_signature(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_hash_json_path_tampered_raw_body() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(bodyHashBinding=_BODY_HASH_BINDING))
    body_hash = hashlib.sha256(_BODY.encode("utf-8")).hexdigest()
    url = f"https://example.com/sms?bodySHA256={body_hash}"
    signature = _sign(url)
    assert not helper.verify_signature(
        request_body='{"tampered":true}', signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_hash_query_hash_tampered() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(bodyHashBinding=_BODY_HASH_BINDING))
    url = "https://example.com/sms?bodySHA256=deadbeef"
    signature = _sign(url)
    assert not helper.verify_signature(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_body_hash_absent_falls_back_to_form_path() -> None:
    helper = _render_helper("WebhooksHelper", _hmac_config(bodyHashBinding=_BODY_HASH_BINDING))
    url = "https://example.com/sms"  # no bodySHA256 -> classic form path signs URL + body
    signature = _sign(url + _BODY)
    assert helper.verify_signature(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def _twilio_helper() -> typing.Any:
    return _render_helper(
        "SmsStatusWebhooksHelper",
        _hmac_config(
            payloadFormat=_BODY_SORT_FORMAT,
            bodyHashBinding=_BODY_HASH_BINDING,
            notificationUrlNormalization=_URL_NORMALIZATION,
        ),
    )


def test_generated_full_twilio_json_path_any_match_standard_port() -> None:
    helper = _twilio_helper()
    body_hash = hashlib.sha256(_BODY.encode("utf-8")).hexdigest()
    url = f"https://example.com/sms?MessageStatus=delivered&bodySHA256={body_hash}"
    # Twilio signed the with-standard-port form; the candidate loop must still match.
    signed_form = f"https://example.com:443/sms?MessageStatus=delivered&bodySHA256={body_hash}"
    signature = _sign(signed_form)
    assert helper.verify_signature(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_full_twilio_form_path_multimap() -> None:
    helper = _twilio_helper()
    url = "https://example.com/sms"
    params = {"MessageStatus": "delivered", "From": ["+15551234567", "+15551234567"], "To": "+15559876543"}
    signature = _sign(url + _form_body_string(params))
    assert helper.verify_signature(
        request_body=params, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_full_twilio_wrong_secret() -> None:
    helper = _twilio_helper()
    body_hash = hashlib.sha256(_BODY.encode("utf-8")).hexdigest()
    url = f"https://example.com/sms?bodySHA256={body_hash}"
    signature = _sign(url, secret="wrong")
    assert not helper.verify_signature(
        request_body=_BODY, signature_header=signature, signature_key=_SECRET, notification_url=url
    )


def test_generated_no_throw_on_null_inputs() -> None:
    helper = _twilio_helper()
    url = "https://example.com/sms"
    assert (
        helper.verify_signature(request_body=None, signature_header="sig", signature_key=_SECRET, notification_url=url)
        is False
    )
    assert (
        helper.verify_signature(request_body=_BODY, signature_header=None, signature_key=_SECRET, notification_url=url)
        is False
    )
