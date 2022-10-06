import typing

import pydantic

from ....commons.variable_type import VariableType
from .parameter import Parameter


class NonVoidFunctionSignature(pydantic.BaseModel):
    parameters: typing.List[Parameter]
    return_type: VariableType = pydantic.Field(alias="returnType")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
