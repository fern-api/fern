from core_utilities.shared.http_client import get_request_body, remove_none_from_dict
from core_utilities.shared.request_options import RequestOptions


def get_request_options() -> RequestOptions:
    return {"additional_body_parameters": {"see you": "later"}}


def get_request_options_with_none() -> RequestOptions:
    return {"additional_body_parameters": {"see you": "later", "optional": None}}


def test_get_json_request_body() -> None:
    json_body, data_body = get_request_body(
        json={"hello": "world"}, data=None, request_options=None, omit=None
    )
    assert json_body == {"hello": "world"}
    assert data_body is None

    json_body_extras, data_body_extras = get_request_body(
        json={"goodbye": "world"},
        data=None,
        request_options=get_request_options(),
        omit=None,
    )

    assert json_body_extras == {"goodbye": "world", "see you": "later"}
    assert data_body_extras is None


def test_get_files_request_body() -> None:
    json_body, data_body = get_request_body(
        json=None, data={"hello": "world"}, request_options=None, omit=None
    )
    assert data_body == {"hello": "world"}
    assert json_body is None

    json_body_extras, data_body_extras = get_request_body(
        json=None,
        data={"goodbye": "world"},
        request_options=get_request_options(),
        omit=None,
    )

    assert data_body_extras == {"goodbye": "world", "see you": "later"}
    assert json_body_extras is None


def test_get_none_request_body() -> None:
    json_body, data_body = get_request_body(
        json=None, data=None, request_options=None, omit=None
    )
    assert data_body is None
    assert json_body is None

    json_body_extras, data_body_extras = get_request_body(
        json=None, data=None, request_options=get_request_options(), omit=None
    )

    assert json_body_extras == {"see you": "later"}
    assert data_body_extras is None


def test_get_empty_json_request_body_when_json_is_none() -> None:
    """Test that when json=None and no additional body params, we send no body."""
    unrelated_request_options: RequestOptions = {"max_retries": 3}
    json_body, data_body = get_request_body(
        json=None, data=None, request_options=unrelated_request_options, omit=None
    )
    assert json_body is None
    assert data_body is None


def test_get_empty_json_request_body_when_json_is_explicit_empty_dict() -> None:
    """Test that when json={} is explicitly passed, we preserve it as {} (not None).

    This is important for APIs that require an empty JSON body to be sent,
    e.g., when an endpoint has a request body type but all fields are optional.
    """
    unrelated_request_options: RequestOptions = {"max_retries": 3}
    json_body, data_body = get_request_body(
        json={}, data=None, request_options=unrelated_request_options, omit=None
    )

    assert json_body == {}
    assert data_body is None


def test_get_empty_json_request_body_with_empty_additional_body_params() -> None:
    """Test that when json=None and additional_body_parameters={}, we send no body."""
    request_options_with_empty_additional: RequestOptions = {
        "additional_body_parameters": {}
    }
    json_body, data_body = get_request_body(
        json=None,
        data=None,
        request_options=request_options_with_empty_additional,
        omit=None,
    )
    assert json_body is None
    assert data_body is None


def test_json_body_preserves_none_values() -> None:
    """Test that JSON bodies preserve None values (they become JSON null)."""
    json_body, data_body = get_request_body(
        json={"hello": "world", "optional": None},
        data=None,
        request_options=None,
        omit=None,
    )
    # JSON bodies should preserve None values
    assert json_body == {"hello": "world", "optional": None}
    assert data_body is None


def test_data_body_preserves_none_values_without_multipart() -> None:
    """Test that data bodies preserve None values when not using multipart.

    The filtering of None values happens in HttpClient.request/stream methods,
    not in get_request_body. This test verifies get_request_body doesn't filter None.
    """
    json_body, data_body = get_request_body(
        json=None,
        data={"hello": "world", "optional": None},
        request_options=None,
        omit=None,
    )
    # get_request_body should preserve None values in data body
    # The filtering happens later in HttpClient.request when multipart is detected
    assert data_body == {"hello": "world", "optional": None}
    assert json_body is None


def test_remove_none_from_dict_filters_none_values() -> None:
    """Test that remove_none_from_dict correctly filters out None values."""
    original = {
        "hello": "world",
        "optional": None,
        "another": "value",
        "also_none": None,
    }
    filtered = remove_none_from_dict(original)
    assert filtered == {"hello": "world", "another": "value"}
    # Original should not be modified
    assert original == {
        "hello": "world",
        "optional": None,
        "another": "value",
        "also_none": None,
    }


def test_remove_none_from_dict_empty_dict() -> None:
    """Test that remove_none_from_dict handles empty dict."""
    assert remove_none_from_dict({}) == {}


def test_remove_none_from_dict_all_none() -> None:
    """Test that remove_none_from_dict handles dict with all None values."""
    assert remove_none_from_dict({"a": None, "b": None}) == {}
