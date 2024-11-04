from pydantic import BaseModel
from resources.problem.types import (
    ProblemDescription,
    ProblemFiles,
    VariableTypeAndName,
)
from typing import Dict, List
from resources.commons.types import Language, VariableType, TestCaseWithExpectedResult


class CreateProblemRequest(BaseModel):
    problem_name: str
    problem_description: ProblemDescription
    files: Dict[Language, ProblemFiles]
    input_params: List[VariableTypeAndName]
    output_type: VariableType
    testcases: List[TestCaseWithExpectedResult]
    method_name: str
