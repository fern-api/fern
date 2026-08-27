from core_utilities.shared.query_encoder import encode_query


def test_query_encoding_explodes_objects() -> None:
    assert encode_query({"hello world": "hello world"}) == [("hello world", "hello world")]
    # an object query parameter is exploded: the parameter's own name does not reach the wire
    assert encode_query({"hello_world": {"hello": "world"}}) == [("hello", "world")]
    # only the levels below the first stay bracketed
    assert encode_query({"hello_world": {"hello": {"world": "today"}, "test": "this"}, "hi": "there"}) == [
        ("hello[world]", "today"),
        ("test", "this"),
        ("hi", "there"),
    ]


def test_query_encoding_explodes_operator_keys() -> None:
    # the case the format exists for: keys carrying both the field and the operator
    assert encode_query({"filter": {"category": "books", "createdDate:gte": "2023-01-01"}}) == [
        ("category", "books"),
        ("createdDate:gte", "2023-01-01"),
    ]


def test_query_encoding_deep_object_arrays() -> None:
    assert encode_query({"objects": [{"key": "hello", "value": "world"}, {"key": "foo", "value": "bar"}]}) == [
        ("objects[key]", "hello"),
        ("objects[value]", "world"),
        ("objects[key]", "foo"),
        ("objects[value]", "bar"),
    ]
    assert encode_query(
        {"users": [{"name": "string", "tags": ["string"]}, {"name": "string2", "tags": ["string2", "string3"]}]}
    ) == [
        ("users[name]", "string"),
        ("users[tags]", "string"),
        ("users[name]", "string2"),
        ("users[tags]", "string2"),
        ("users[tags]", "string3"),
    ]


def test_encode_query_with_none() -> None:
    encoded = encode_query(None)
    assert encoded is None
