import typing

import pydantic

from ...commons.language import Language


class GetFunctionSignatureResponse(pydantic.BaseModel):
    function_by_language: typing.Dict[Language, str] = pydantic.Field(alias="functionByLanguage")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
