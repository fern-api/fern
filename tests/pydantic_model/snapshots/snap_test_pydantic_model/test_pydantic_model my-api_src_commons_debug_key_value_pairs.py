from __future__ import annotations

import typing

import pydantic


class DebugKeyValuePairs(pydantic.BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


from .debug_variable_value import DebugVariableValue  # noqa: E402

DebugKeyValuePairs.update_forward_refs()
