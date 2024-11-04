from pydantic import BaseModel
from resources.problem.types import ProblemDescription
from typing import Set, List
from resources.commons.types import Language
from resources.v_2.resources.v_3.resources.problem.types import (
    CustomFiles,
    GeneratedFiles,
    TestCaseTemplate,
    TestCaseV2,
)


class ProblemInfoV2(BaseModel):
    problem_id: str
    problem_description: ProblemDescription
    problem_name: str
    problem_version: int
    supported_languages: Set[Language]
    custom_files: CustomFiles
    generated_files: GeneratedFiles
    custom_test_case_templates: List[TestCaseTemplate]
    testcases: List[TestCaseV2]
    is_public: bool
