from __future__ import annotations

import typing

import pydantic


class KeyValuePair(pydantic.BaseModel):
    key: VariableValue
    value: VariableValue

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


from .variable_value import VariableValue  # noqa: E402

KeyValuePair.update_forward_refs()
