from typing import Optional

import pydantic
from core_utilities.sdk.pagination import get_nested_page_value, with_nested_page_value


class _Options(pydantic.BaseModel):
    count: Optional[int] = None
    offset: Optional[int] = None


def test_get_nested_page_value_handles_missing_containers() -> None:
    assert get_nested_page_value(None, ["offset"]) is None
    assert get_nested_page_value(..., ["offset"]) is None
    assert get_nested_page_value({"count": 2}, ["offset"]) is None
    assert get_nested_page_value({"offset": 3}, ["offset"]) == 3
    assert get_nested_page_value(_Options(offset=4), ["offset"]) == 4
    assert get_nested_page_value({"offset": 0}, ["offset"], 1) == 0
    assert get_nested_page_value({"count": 2}, ["offset"], 1) == 1


def test_with_nested_page_value_creates_omitted_container() -> None:
    assert with_nested_page_value(None, ["offset"], 1) == {"offset": 1}
    assert with_nested_page_value(..., ["offset"], 1) == {"offset": 1}


def test_with_nested_page_value_preserves_other_fields() -> None:
    original = {"count": 10, "offset": 0}
    assert with_nested_page_value(original, ["offset"], 10) == {"count": 10, "offset": 10}
    assert original == {"count": 10, "offset": 0}


def test_with_nested_page_value_updates_models() -> None:
    updated = with_nested_page_value(_Options(count=5, offset=0), ["offset"], 5)
    assert isinstance(updated, _Options)
    assert updated.count == 5 and updated.offset == 5
