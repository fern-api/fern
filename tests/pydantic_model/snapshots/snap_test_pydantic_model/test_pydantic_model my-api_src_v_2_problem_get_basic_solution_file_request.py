import typing

import pydantic

from .non_void_function_signature import NonVoidFunctionSignature


class GetBasicSolutionFileRequest(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    signature: NonVoidFunctionSignature

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
