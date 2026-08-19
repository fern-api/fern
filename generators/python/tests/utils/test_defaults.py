from tests.utils.example_models.types.resources.types.object_with_defaults import ObjectWithDefaults


def test_defaulted_object() -> None:
    obj_with_none = ObjectWithDefaults(decimal=None, string=None, required_string="something else")

    assert obj_with_none.decimal is None
    assert obj_with_none.string is None
    assert obj_with_none.required_string == "something else"


def test_defaulted_object_with_defaults() -> None:
    # Pydantic model fields no longer have primitive defaults from the IR.
    # Optional fields default to None, and required fields must be provided.
    obj_with_defaults = ObjectWithDefaults(required_string="I neeeeeeeeeed this!")

    assert obj_with_defaults.decimal is None
    assert obj_with_defaults.string is None
    assert obj_with_defaults.required_string == "I neeeeeeeeeed this!"


def test_with_non_none_setting() -> None:
    obj_with_defaults = ObjectWithDefaults(decimal=3.14, string="hello", required_string="something else")

    assert obj_with_defaults.decimal == 3.14
    assert obj_with_defaults.string == "hello"
    assert obj_with_defaults.required_string == "something else"
