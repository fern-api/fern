from __future__ import annotations

import typing

import pydantic


class MapValue(pydantic.BaseModel):
    key_value_pairs: typing.List[KeyValuePair] = pydantic.Field(alias="keyValuePairs")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True


from .key_value_pair import KeyValuePair  # noqa: E402

MapValue.update_forward_refs()
