import typing

import pydantic

from .function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from .parameter import Parameter


class VoidFunctionDefinitionThatTakesActualResult(pydantic.BaseModel):
    additional_parameters: typing.List[Parameter] = pydantic.Field(alias="additionalParameters")
    code: FunctionImplementationForMultipleLanguages

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
