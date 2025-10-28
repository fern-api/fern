from seed.types import OptionalAlias
from seed.core import parse_obj_as

def test_alias_serialization():
    alias = OptionalAlias.from_str("test")
    assert alias.model_dump() == "test"
    assert alias.dict() == "test"
    assert alias.json() == '"test"'


def test_alias_serialization_with_none():
    alias = OptionalAlias.from_str(None)
    assert alias.model_dump() is None
    assert alias.dict() is None
    assert alias.json() == 'null'


def test_alias_deserialization():
    alias = parse_obj_as(type_=OptionalAlias, object_="test")
    assert alias.root == "test"
    assert alias.get_as_str() == "test"

def test_alias_deserialization_with_none():
    alias = parse_obj_as(type_=OptionalAlias, object_=None)
    assert alias.root is None
    assert alias.get_as_str() is None
