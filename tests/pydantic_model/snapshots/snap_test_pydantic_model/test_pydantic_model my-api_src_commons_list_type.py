from __future__ import annotations

import typing

import pydantic


class ListType(pydantic.BaseModel):
    value_type: VariableType = pydantic.Field(alias="valueType")
    is_fixed_length: typing.Optional[bool] = pydantic.Field(alias="isFixedLength")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True


from .variable_type import VariableType  # noqa: E402

ListType.update_forward_refs()
