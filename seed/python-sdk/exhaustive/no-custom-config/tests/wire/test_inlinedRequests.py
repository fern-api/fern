from .conftest import get_client, verify_request_count

from seed import TypesObjectWithOptionalField


def test_inlinedRequests_post_with_object_bodyand_response() -> None:
    """Test postWithObjectBodyandResponse endpoint with WireMock"""
    test_id = "inlined_requests.post_with_object_bodyand_response.0"
    client = get_client(test_id)
    client.inlined_requests.post_with_object_bodyand_response(
        string="string",
        integer=1,
        nested_object=TypesObjectWithOptionalField(),
    )
    verify_request_count(test_id, "POST", "/req-bodies/object", None, 1)
