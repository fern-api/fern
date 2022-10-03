import typing

import pydantic

from ....commons.language import Language


class GetFunctionSignatureResponse(pydantic.BaseModel):
    function_by_language: typing.Dict[Language, str] = pydantic.Field(alias="functionByLanguage")

    class Config:
        allow_population_by_field_name = True
