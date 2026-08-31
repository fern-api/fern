import pytest

import pydantic
from core_utilities.shared.pydantic_utilities import (
    UniversalBaseModel,
    _coerce_keys_to_aliases,
    _get_field_aliases,
    parse_obj_as,
)


class Inner(UniversalBaseModel):
    type_: str = pydantic.Field(alias="type")
    text: str


class Outer(UniversalBaseModel):
    type_: str = pydantic.Field(alias="type")
    content: Inner


class NoAliases(UniversalBaseModel):
    text: str
    index: int


class Ambiguous(UniversalBaseModel):
    # `alias` of `first` collides with the field name of `second`
    first: str = pydantic.Field(alias="second")
    second: str = pydantic.Field(alias="second_alias")


# `alias` of `first` collides with the field name of `second`, which has no alias of its own. Built with
# `create_model` because the two fields would collide in the `__init__` signature Pydantic's mypy plugin
# synthesizes for a class definition.
Shadowed = pydantic.create_model(
    "Shadowed",
    __base__=UniversalBaseModel,
    first=(str, pydantic.Field(alias="second")),
    second=(str, ...),
)


def test_field_names_are_coerced_to_aliases() -> None:
    parsed = parse_obj_as(Outer, {"type_": "outer", "content": {"type_": "text", "text": "hello"}})
    assert parsed.type_ == "outer"
    assert parsed.content.type_ == "text"
    assert parsed.content.text == "hello"


def test_wire_keys_still_parse() -> None:
    parsed = parse_obj_as(Outer, {"type": "outer", "content": {"type": "text", "text": "hello"}})
    assert parsed.type_ == "outer"
    assert parsed.content.text == "hello"


def test_ambiguous_key_raises() -> None:
    # `second` could mean the alias of `first` or the field name of `second`
    with pytest.raises(pydantic.ValidationError, match="Ambiguous input key"):
        parse_obj_as(Ambiguous, {"second": "value"})


def test_ambiguous_key_accepted_when_disambiguated() -> None:
    parsed = parse_obj_as(Ambiguous, {"second": "a", "second_alias": "b"})
    assert parsed.first == "a"
    assert parsed.second == "b"


def test_key_shadowing_a_non_aliased_field_is_not_ambiguous() -> None:
    # `second` is the alias of `first` and the name of a field that has no alias of its own, so there is no
    # other key that could disambiguate it: it feeds both fields rather than raising.
    assert _coerce_keys_to_aliases(Shadowed, {"second": "value"}) == {"second": "value"}
    parsed = parse_obj_as(Shadowed, {"second": "value"})
    assert parsed.dict() == {"second": "value"}


def test_field_aliases_are_computed_once_per_model() -> None:
    assert _get_field_aliases(Outer) is _get_field_aliases(Outer)
    assert _get_field_aliases(Outer)[0] == {"type_": "type"}
    assert _get_field_aliases(NoAliases)[0] == {}


def test_models_without_aliases_skip_the_rewrite() -> None:
    data = {"text": "hello", "index": 0}
    assert _coerce_keys_to_aliases(NoAliases, data) is data
    assert parse_obj_as(NoAliases, data).text == "hello"


def test_alias_only_payloads_skip_the_rewrite() -> None:
    data = {"type": "outer"}
    assert _coerce_keys_to_aliases(Outer, data) is data


def test_non_mapping_input_is_passed_through() -> None:
    assert _coerce_keys_to_aliases(NoAliases, "not-a-mapping") == "not-a-mapping"
