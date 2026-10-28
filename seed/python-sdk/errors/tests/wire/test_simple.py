import pytest
from .conftest import get_client, verify_request_count

from seed.commons import BadRequestError, InternalServerError, NotFoundError
from seed.core.jsonable_encoder import jsonable_encoder
from seed.simple import FooTooLittle, FooTooMuch


def test_simple_foo_without_endpoint_error() -> None:
    """Test fooWithoutEndpointError endpoint with WireMock"""
    test_id = "simple.foo_without_endpoint_error.0"
    client = get_client(test_id)
    client.simple.foo_without_endpoint_error(
        bar="bar",
    )
    verify_request_count(test_id, "POST", "/foo1", None, 1)


def test_simple_foo_without_endpoint_error_throws_not_found_error() -> None:
    """Test fooWithoutEndpointError endpoint error response (NotFoundError) with WireMock"""
    test_id = "simple.foo_without_endpoint_error.1"
    client = get_client(test_id)
    with pytest.raises(NotFoundError) as exc_info:
        client.simple.foo_without_endpoint_error(
            bar="bar",
        )
    assert exc_info.value.status_code == 404
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo1", None, 1)


def test_simple_foo_without_endpoint_error_throws_bad_request_error() -> None:
    """Test fooWithoutEndpointError endpoint error response (BadRequestError) with WireMock"""
    test_id = "simple.foo_without_endpoint_error.2"
    client = get_client(test_id)
    with pytest.raises(BadRequestError) as exc_info:
        client.simple.foo_without_endpoint_error(
            bar="bar",
        )
    assert exc_info.value.status_code == 400
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo1", None, 1)


def test_simple_foo_without_endpoint_error_throws_internal_server_error() -> None:
    """Test fooWithoutEndpointError endpoint error response (InternalServerError) with WireMock"""
    test_id = "simple.foo_without_endpoint_error.3"
    client = get_client(test_id)
    with pytest.raises(InternalServerError) as exc_info:
        client.simple.foo_without_endpoint_error(
            bar="bar",
        )
    assert exc_info.value.status_code == 500
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo1", None, 1)


def test_simple_foo() -> None:
    """Test foo endpoint with WireMock"""
    test_id = "simple.foo.0"
    client = get_client(test_id)
    client.simple.foo(
        bar="bar",
    )
    verify_request_count(test_id, "POST", "/foo2", None, 1)


def test_simple_foo_throws_foo_too_much() -> None:
    """Test foo endpoint error response (FooTooMuch) with WireMock"""
    test_id = "simple.foo.1"
    client = get_client(test_id)
    with pytest.raises(FooTooMuch) as exc_info:
        client.simple.foo(
            bar="bar",
        )
    assert exc_info.value.status_code == 429
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo2", None, 1)


def test_simple_foo_throws_foo_too_little() -> None:
    """Test foo endpoint error response (FooTooLittle) with WireMock"""
    test_id = "simple.foo.2"
    client = get_client(test_id)
    with pytest.raises(FooTooLittle) as exc_info:
        client.simple.foo(
            bar="bar",
        )
    assert exc_info.value.status_code == 500
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo2", None, 1)


def test_simple_foo_throws_not_found_error() -> None:
    """Test foo endpoint error response (NotFoundError) with WireMock"""
    test_id = "simple.foo.3"
    client = get_client(test_id)
    with pytest.raises(NotFoundError) as exc_info:
        client.simple.foo(
            bar="bar",
        )
    assert exc_info.value.status_code == 404
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo2", None, 1)


def test_simple_foo_throws_bad_request_error() -> None:
    """Test foo endpoint error response (BadRequestError) with WireMock"""
    test_id = "simple.foo.4"
    client = get_client(test_id)
    with pytest.raises(BadRequestError) as exc_info:
        client.simple.foo(
            bar="bar",
        )
    assert exc_info.value.status_code == 400
    assert jsonable_encoder(exc_info.value.body) == {"message": "message", "code": 1}
    verify_request_count(test_id, "POST", "/foo2", None, 1)


def test_simple_foo_with_examples() -> None:
    """Test fooWithExamples endpoint with WireMock"""
    test_id = "simple.foo_with_examples.0"
    client = get_client(test_id)
    client.simple.foo_with_examples(
        bar="hello",
    )
    verify_request_count(test_id, "POST", "/foo3", None, 1)


def test_simple_foo_with_examples_throws_foo_too_much() -> None:
    """Test fooWithExamples endpoint error response (FooTooMuch) with WireMock"""
    test_id = "simple.foo_with_examples.1"
    client = get_client(test_id)
    with pytest.raises(FooTooMuch) as exc_info:
        client.simple.foo_with_examples(
            bar="hello",
        )
    assert exc_info.value.status_code == 429
    assert jsonable_encoder(exc_info.value.body) == {"message": "Too much foo", "code": 1}
    verify_request_count(test_id, "POST", "/foo3", None, 1)


def test_simple_foo_with_examples_throws_foo_too_little() -> None:
    """Test fooWithExamples endpoint error response (FooTooLittle) with WireMock"""
    test_id = "simple.foo_with_examples.2"
    client = get_client(test_id)
    with pytest.raises(FooTooLittle) as exc_info:
        client.simple.foo_with_examples(
            bar="hello",
        )
    assert exc_info.value.status_code == 500
    assert jsonable_encoder(exc_info.value.body) == {"message": "Too little foo", "code": 2}
    verify_request_count(test_id, "POST", "/foo3", None, 1)
