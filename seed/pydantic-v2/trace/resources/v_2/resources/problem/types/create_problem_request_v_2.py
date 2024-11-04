from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from resources.v_2.resources.problem.types.custom_files import CustomFiles
from typing import List, Set
from resources.v_2.resources.problem.types.test_case_template import TestCaseTemplate
from resources.v_2.resources.problem.types.test_case_v_2 import TestCaseV2
from resources.commons.types.language import Language
from dt import datetime
from core.datetime_utils import serialize_datetime
class CreateProblemRequestV2(BaseModel):
    problem_name: str = 
    problem_description: ProblemDescription = 
    custom_files: CustomFiles = 
    custom_test_case_templates: List[TestCaseTemplate] = 
    testcases: List[TestCaseV2]
    supported_languages: Set[Language] = 
    is_public: bool = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

