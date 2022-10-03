import typing

import pydantic

from ..commons.debug_variable_value import DebugVariableValue


class Scope(pydantic.BaseModel):
    variables: typing.Dict[str, DebugVariableValue]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
