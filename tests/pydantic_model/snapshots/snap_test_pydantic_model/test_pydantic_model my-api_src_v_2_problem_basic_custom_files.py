import typing

import pydantic

from ...commons.language import Language
from .basic_test_case_template import BasicTestCaseTemplate
from .files import Files
from .non_void_function_signature import NonVoidFunctionSignature


class BasicCustomFiles(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    signature: NonVoidFunctionSignature
    additional_files: typing.Dict[Language, Files] = pydantic.Field(alias="additionalFiles")
    basic_test_case_template: BasicTestCaseTemplate = pydantic.Field(alias="basicTestCaseTemplate")

    class Config:
        allow_population_by_field_name = True
