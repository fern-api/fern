from pydantic import BaseModel
from resources.v_2.resources.problem.types.non_void_function_signature import (
    NonVoidFunctionSignature,
)
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.files import Files
from resources.v_2.resources.problem.types.basic_test_case_template import (
    BasicTestCaseTemplate,
)


class BasicCustomFiles(BaseModel):
    method_name: str = Field(alias="methodName")
    signature: NonVoidFunctionSignature
    additional_files: Dict[Language, Files] = Field(alias="additionalFiles")
    basic_test_case_template: BasicTestCaseTemplate = Field(
        alias="basicTestCaseTemplate"
    )
