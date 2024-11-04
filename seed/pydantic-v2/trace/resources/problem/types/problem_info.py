from pydantic import BaseModel
from resources.problem.types import (
    ProblemDescription,
    ProblemFiles,
    VariableTypeAndName,
)
from typing import Dict, List
from resources.commons.types import Language, VariableType, TestCaseWithExpectedResult


class ProblemInfo(BaseModel):
    problem_id: str
    problem_description: ProblemDescription
    problem_name: str
    problem_version: int
    files: Dict[Language, ProblemFiles]
    input_params: List[VariableTypeAndName]
    output_type: VariableType
    testcases: List[TestCaseWithExpectedResult]
    method_name: str
    supports_custom_test_cases: bool
