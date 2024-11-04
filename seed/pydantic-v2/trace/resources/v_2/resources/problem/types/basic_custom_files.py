from pydantic import BaseModel
from resources.v_2.resources.problem.types import (
    NonVoidFunctionSignature,
    Files,
    BasicTestCaseTemplate,
)
from typing import Dict
from resources.commons.types import Language


class BasicCustomFiles(BaseModel):
    method_name: str
    signature: NonVoidFunctionSignature
    additional_files: Dict[Language, Files]
    basic_test_case_template: BasicTestCaseTemplate
