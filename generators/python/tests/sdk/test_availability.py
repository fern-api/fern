from typing import Optional

import fern.ir.resources as ir_types
import pytest

from fern_python.generators.sdk.client_generator.availability import get_availability_docs


def _make_endpoint(availability: Optional[ir_types.Availability]) -> ir_types.HttpEndpoint:
    class _StubEndpoint:
        pass

    endpoint = _StubEndpoint()
    endpoint.availability = availability  # type: ignore[attr-defined]
    return endpoint  # type: ignore[return-value]


def test_get_availability_docs_none_when_no_availability() -> None:
    assert get_availability_docs(_make_endpoint(None)) is None


def test_get_availability_docs_general_availability_returns_none() -> None:
    availability = ir_types.Availability(status=ir_types.AvailabilityStatus.GENERAL_AVAILABILITY)
    assert get_availability_docs(_make_endpoint(availability)) is None


def test_get_availability_docs_general_availability_with_message_returns_none() -> None:
    availability = ir_types.Availability(
        status=ir_types.AvailabilityStatus.GENERAL_AVAILABILITY,
        message="all good",
    )
    assert get_availability_docs(_make_endpoint(availability)) is None


def test_get_availability_docs_deprecated_without_message() -> None:
    availability = ir_types.Availability(status=ir_types.AvailabilityStatus.DEPRECATED)
    assert get_availability_docs(_make_endpoint(availability)) == "@deprecated"


def test_get_availability_docs_deprecated_with_message_uses_sphinx_block() -> None:
    availability = ir_types.Availability(
        status=ir_types.AvailabilityStatus.DEPRECATED,
        message="use `getMovieV2` instead",
    )
    assert (
        get_availability_docs(_make_endpoint(availability))
        == ".. deprecated::\n    use `getMovieV2` instead"
    )


def test_get_availability_docs_in_development_without_message() -> None:
    availability = ir_types.Availability(status=ir_types.AvailabilityStatus.IN_DEVELOPMENT)
    assert (
        get_availability_docs(_make_endpoint(availability))
        == ".. warning::\n    This endpoint is in development and may change."
    )


def test_get_availability_docs_in_development_with_message() -> None:
    availability = ir_types.Availability(
        status=ir_types.AvailabilityStatus.IN_DEVELOPMENT,
        message="schema will change",
    )
    assert (
        get_availability_docs(_make_endpoint(availability))
        == ".. warning::\n    This endpoint is in development and may change. schema will change"
    )


def test_get_availability_docs_pre_release_without_message() -> None:
    availability = ir_types.Availability(status=ir_types.AvailabilityStatus.PRE_RELEASE)
    assert (
        get_availability_docs(_make_endpoint(availability))
        == ".. warning::\n    This endpoint is in pre-release and may change."
    )


def test_get_availability_docs_pre_release_with_message() -> None:
    availability = ir_types.Availability(
        status=ir_types.AvailabilityStatus.PRE_RELEASE,
        message="expect bugs",
    )
    assert (
        get_availability_docs(_make_endpoint(availability))
        == ".. warning::\n    This endpoint is in pre-release and may change. expect bugs"
    )


if __name__ == "__main__":  # pragma: no cover
    pytest.main([__file__])
