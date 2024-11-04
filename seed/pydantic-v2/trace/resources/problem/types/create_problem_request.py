from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from typing import Dict, List
from resources.commons.types.language import Language
from resources.problem.types.problem_files import ProblemFiles
from resources.problem.types.variable_type_and_name import VariableTypeAndName
from resources.commons.types.variable_type import VariableType
from resources.commons.types.test_case_with_expected_result import TestCaseWithExpectedResult
from dt import datetime
from core.datetime_utils import serialize_datetime
class CreateProblemRequest(BaseModel):
    problem_name: str = 
    problem_description: ProblemDescription = 
    files: Dict[Language, ProblemFiles]
    input_params: List[VariableTypeAndName] = 
    output_type: VariableType = 
    testcases: List[TestCaseWithExpectedResult]
    method_name: str = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

