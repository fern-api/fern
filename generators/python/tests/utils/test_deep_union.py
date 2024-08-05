from core_utilities.sdk.pydantic_utilities import deep_union_pydantic_dicts


def test_deep_union() -> None:
    obj1 = {"a": 1, "b": 2, "c": 3}
    obj2 = {"a": 4, "b": 5, "d": 6}
    expected = {"a": 1, "b": 2, "c": 3, "d": 6}

    deep_union_pydantic_dicts(obj1, obj2)

    assert obj2 == expected

def test_deep_union_nested() -> None:
    obj1 = {"a": 1, "b": {"c": 2, "d": {"1": 2}}, "e": 3}
    obj2 = {"b": {"c": {"2": 3}, "d": {"3": 4}}, "e": {"f": 3}}
    expected = {"a": 1, "b": {"c": 2, "d": {"1": 2, "3": 4}},  "e": 3}

    deep_union_pydantic_dicts(obj1, obj2)

    assert obj2 == expected
