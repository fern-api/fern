from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from typing import Set, List
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.custom_files import CustomFiles
from resources.v_2.resources.problem.types.generated_files import GeneratedFiles
from resources.v_2.resources.problem.types.test_case_template import TestCaseTemplate
from resources.v_2.resources.problem.types.test_case_v_2 import TestCaseV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class ProblemInfoV2(BaseModel):
    problem_id: str = 
    problem_description: ProblemDescription = 
    problem_name: str = 
    problem_version: int = 
    supported_languages: Set[Language] = 
    custom_files: CustomFiles = 
    generated_files: GeneratedFiles = 
    custom_test_case_templates: List[TestCaseTemplate] = 
    testcases: List[TestCaseV2]
    is_public: bool = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

