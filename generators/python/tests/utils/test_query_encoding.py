
from core_utilities.sdk.query_encoder import encode_query


def test_query_encoding() -> None:
    assert encode_query({"hello world": "hello world"}) == {"hello world": "hello world"}
    assert encode_query({"hello_world": {"hello" : "world"}}) == {"hello_world[hello]": "world"}
    assert encode_query({"hello_world": {"hello" : {"world" : "today"}, "test": "this"}, "hi": "there"}) == {"hello_world[hello][world]": "today", "hello_world[test]": "this", "hi": "there"}

def test_encode_query_with_none() -> None:
    encoded = encode_query(None)
    assert encoded == None
