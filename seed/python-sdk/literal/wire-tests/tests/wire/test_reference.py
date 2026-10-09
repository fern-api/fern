from .conftest import get_client, verify_request_count

from seed.reference import ContainerObject, NestedObjectWithLiterals


def test_reference_send() -> None:
    """Test send endpoint with WireMock"""
    test_id = "reference.send.0"
    client = get_client(test_id)
    client.reference.send(
        query="What is the weather today",
        container_object=ContainerObject(
            nested_objects=[
                NestedObjectWithLiterals(
                    literal1="literal1",
                    literal2="literal2",
                    str_prop="strProp",
                )
            ],
        ),
    )
    verify_request_count(test_id, "POST", "/reference", None, 1)
