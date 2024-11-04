from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from typing import Dict, List
from resources.commons.types.language import Language
from resources.problem.types.problem_files import ProblemFiles
from resources.problem.types.variable_type_and_name import VariableTypeAndName
from resources.commons.types.variable_type import VariableType
from resources.commons.types.test_case_with_expected_result import (
    TestCaseWithExpectedResult,
)


class ProblemInfo(BaseModel):
    problem_id: str = Field(alias="problemId")
    problem_description: ProblemDescription = Field(alias="problemDescription")
    problem_name: str = Field(alias="problemName")
    problem_version: int = Field(alias="problemVersion")
    files: Dict[Language, ProblemFiles]
    input_params: List[VariableTypeAndName] = Field(alias="inputParams")
    output_type: VariableType = Field(alias="outputType")
    testcases: List[TestCaseWithExpectedResult]
    method_name: str = Field(alias="methodName")
    supports_custom_test_cases: bool = Field(alias="supportsCustomTestCases")
