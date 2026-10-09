from .conftest import get_client, verify_request_count

from seed.inlined import ANestedLiteral, ATopLevelLiteral


def test_inlined_send() -> None:
    """Test send endpoint with WireMock"""
    test_id = "inlined.send.0"
    client = get_client(test_id)
    client.inlined.send(
        query="What is the weather today",
        temperature=10.1,
        object_with_literal=ATopLevelLiteral(
            nested_literal=ANestedLiteral(
                my_literal="How super cool",
            ),
        ),
    )
    verify_request_count(test_id, "POST", "/inlined", None, 1)
