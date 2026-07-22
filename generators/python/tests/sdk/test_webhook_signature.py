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


# --- ISO-8601 timestamp handling (naive timestamps treated as UTC) ---

_ISO_TIMESTAMP_HEADER_NAME = {
    "name": {
        "originalName": "x-timestamp",
        "camelCase": {"unsafeName": "xTimestamp", "safeName": "xTimestamp"},
        "snakeCase": {"unsafeName": "x_timestamp", "safeName": "x_timestamp"},
        "screamingSnakeCase": {"unsafeName": "X_TIMESTAMP", "safeName": "X_TIMESTAMP"},
        "pascalCase": {"unsafeName": "XTimestamp", "safeName": "XTimestamp"},
    },
    "wireValue": "x-timestamp",
}


def _iso_timestamp_config() -> typing.Any:
    return _hmac_config(
        payloadFormat={"components": ["TIMESTAMP", "BODY"], "delimiter": "."},
        timestamp={"headerName": _ISO_TIMESTAMP_HEADER_NAME, "format": "ISO8601", "tolerance": 300},
    )


def test_generated_iso_timestamp_offsetless_treated_as_utc() -> None:
    # An offset-less ISO timestamp must be interpreted as UTC (not local time) so the
    # tolerance window is not skewed by the runner's timezone.
    import datetime

    helper = _render_helper("WebhooksHelper", _iso_timestamp_config())
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ts_header = now_utc.replace(tzinfo=None).isoformat(timespec="seconds")  # no offset
    payload = ts_header + "." + _BODY
    signature = _sign(payload)
    assert helper.verify_signature(
        request_body=_BODY,
        signature_header=signature,
        signature_key=_SECRET,
        timestamp_header=ts_header,
    )


def test_generated_iso_timestamp_with_z_offset_valid() -> None:
    import datetime

    helper = _render_helper("WebhooksHelper", _iso_timestamp_config())
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    ts_header = now_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    payload = ts_header + "." + _BODY
    signature = _sign(payload)
    assert helper.verify_signature(
        request_body=_BODY,
        signature_header=signature,
        signature_key=_SECRET,
        timestamp_header=ts_header,
    )


def test_generated_iso_timestamp_out_of_tolerance_returns_false() -> None:
    import datetime

    helper = _render_helper("WebhooksHelper", _iso_timestamp_config())
    stale = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)
    ts_header = stale.replace(tzinfo=None).isoformat(timespec="seconds")
    payload = ts_header + "." + _BODY
    signature = _sign(payload)
    assert not helper.verify_signature(
        request_body=_BODY,
        signature_header=signature,
        signature_key=_SECRET,
        timestamp_header=ts_header,
    )


# --- Multi-config file emission (each distinct HMAC config -> its own file) ---


def test_multiple_distinct_configs_produce_distinct_files() -> None:
    """
    Two distinct HMAC configs must be written to two distinct filepaths and both must be
    re-exported, otherwise later helpers overwrite earlier ones on disk while their class
    names remain exported -> broken imports.
    """
    import fern.ir.resources as ir_types

    from fern_python.generators.sdk.webhooks_helper_generator import (
        WEBHOOKS_HELPER_FILE_NAME,
        WebhooksHelperGenerator,
    )

    # Config A is used by two webhooks (becomes the default WebhooksHelper); config B by one
    # (becomes an override helper). They differ by signature header name, so they group apart.
    config_a = _hmac_config()
    header_b = {
        "name": {
            "originalName": "x-other-signature",
            "camelCase": {"unsafeName": "xOtherSignature", "safeName": "xOtherSignature"},
            "snakeCase": {"unsafeName": "x_other_signature", "safeName": "x_other_signature"},
            "screamingSnakeCase": {"unsafeName": "X_OTHER_SIGNATURE", "safeName": "X_OTHER_SIGNATURE"},
            "pascalCase": {"unsafeName": "XOtherSignature", "safeName": "XOtherSignature"},
        },
        "wireValue": "x-other-signature",
    }
    config_b = _hmac_config(signatureHeaderName=header_b)

    def _webhook_name(pascal: str) -> typing.Any:
        return ir_types.Name.model_validate(
            {
                "originalName": pascal,
                "camelCase": {"unsafeName": pascal, "safeName": pascal},
                "snakeCase": {"unsafeName": pascal.lower(), "safeName": pascal.lower()},
                "screamingSnakeCase": {"unsafeName": pascal.upper(), "safeName": pascal.upper()},
                "pascalCase": {"unsafeName": pascal, "safeName": pascal},
            }
        )

    class _FakeWebhook:
        def __init__(self, name: typing.Any, config: typing.Any) -> None:
            self.name = name
            self.signature_verification = ir_types.WebhookSignatureVerification.factory.hmac(config)

    class _FakeIr:
        webhook_groups = {
            "group": [
                _FakeWebhook(_webhook_name("SmsSent"), config_a),
                _FakeWebhook(_webhook_name("SmsDelivered"), config_a),
                _FakeWebhook(_webhook_name("SmsStatus"), config_b),
            ]
        }

    class _FakeContext:
        ir = _FakeIr()

    written_files: typing.Dict[str, str] = {}
    registered_exports: typing.Dict[str, typing.Set[str]] = {}
    root_init_exports: typing.List[str] = []

    class _FakeProject:
        def get_source_file_filepath(self, filepath: typing.Any, include_src_root: bool) -> str:
            parts = [d.module_name for d in filepath.directories] + [filepath.file.module_name + ".py"]
            return "/".join(parts)

        def add_file(self, filepath: str, contents: str) -> None:
            assert filepath not in written_files, f"filepath collision: {filepath}"
            written_files[filepath] = contents

        def register_export_in_project(self, filepath_in_project: typing.Any, exports: typing.Set[str]) -> None:
            key = filepath_in_project.file.module_name
            registered_exports[key] = exports

        def add_init_exports(self, path: typing.Any, exports: typing.Any) -> None:
            for export in exports:
                root_init_exports.extend(export.imports)

    generator = WebhooksHelperGenerator(context=_FakeContext(), project=_FakeProject())  # type: ignore[arg-type]
    generator.generate()

    # Two distinct configs -> exactly two files at distinct paths.
    assert len(written_files) == 2, written_files.keys()
    assert f"webhooks/{WEBHOOKS_HELPER_FILE_NAME}.py" in written_files
    assert "webhooks/sms_status_webhooks_helper.py" in written_files

    # Every exported class name is backed by a file that actually defines it.
    assert set(root_init_exports) == {"WebhooksHelper", "SmsStatusWebhooksHelper"}
    for class_name, expected_module in (
        ("WebhooksHelper", WEBHOOKS_HELPER_FILE_NAME),
        ("SmsStatusWebhooksHelper", "sms_status_webhooks_helper"),
    ):
        matching = [path for path, body in written_files.items() if f"class {class_name}:" in body]
        assert matching == [f"webhooks/{expected_module}.py"], (class_name, matching)
