from __future__ import annotations

import typing

import pydantic


class DebugMapValue(pydantic.BaseModel):
    key_value_pairs: typing.List[DebugKeyValuePairs] = pydantic.Field(alias="keyValuePairs")

    class Config:
        allow_population_by_field_name = True


from .debug_key_value_pairs import DebugKeyValuePairs  # noqa: E402

DebugMapValue.update_forward_refs()
