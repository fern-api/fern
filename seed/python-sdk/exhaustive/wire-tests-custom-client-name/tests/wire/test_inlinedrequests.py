from .conftest import get_client, verify_request_count

from seed import TypesObjectWithOptionalField


def test_inlinedrequests_postwithobjectbodyandresponse() -> None:
    """Test postwithobjectbodyandresponse endpoint with WireMock"""
    test_id = "inlinedrequests.postwithobjectbodyandresponse.0"
    client = get_client(test_id)
    client.inlinedrequests.postwithobjectbodyandresponse(
        string="string",
        integer=1,
        nested_object=TypesObjectWithOptionalField(),
    )
    verify_request_count(test_id, "POST", "/req-bodies/object", None, 1)
