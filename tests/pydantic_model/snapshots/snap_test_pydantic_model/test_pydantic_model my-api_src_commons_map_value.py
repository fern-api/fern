from __future__ import annotations

import typing

import pydantic


class MapValue(pydantic.BaseModel):
    key_value_pairs: typing.List[KeyValuePair] = pydantic.Field(alias="keyValuePairs")

    class Config:
        allow_population_by_field_name = True


from .key_value_pair import KeyValuePair  # noqa: E402

MapValue.update_forward_refs()
