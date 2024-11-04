from pydantic import BaseModel
from resources.problem.types import ProblemDescription
from resources.v_2.resources.problem.types import (
    CustomFiles,
    TestCaseTemplate,
    TestCaseV2,
)
from typing import List, Set
from resources.commons.types import Language


class CreateProblemRequestV2(BaseModel):
    problem_name: str
    problem_description: ProblemDescription
    custom_files: CustomFiles
    custom_test_case_templates: List[TestCaseTemplate]
    testcases: List[TestCaseV2]
    supported_languages: Set[Language]
    is_public: bool
