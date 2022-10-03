import typing

import pydantic

from ....commons.language import Language
from .basic_test_case_template import BasicTestCaseTemplate
from .files import Files
from .non_void_function_signature import NonVoidFunctionSignature


class BasicCustomFiles(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    signature: NonVoidFunctionSignature
    additional_files: typing.Dict[Language, Files] = pydantic.Field(alias="additionalFiles")
    basic_test_case_template: BasicTestCaseTemplate = pydantic.Field(alias="basicTestCaseTemplate")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
