from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from resources.v_2.resources.v_3.resources.problem.types.custom_files import CustomFiles
from typing import List, Set
from resources.v_2.resources.v_3.resources.problem.types.test_case_template import (
    TestCaseTemplate,
)
from resources.v_2.resources.v_3.resources.problem.types.test_case_v_2 import TestCaseV2
from resources.commons.types.language import Language


class CreateProblemRequestV2(BaseModel):
    problem_name: str = Field(alias="problemName")
    problem_description: ProblemDescription = Field(alias="problemDescription")
    custom_files: CustomFiles = Field(alias="customFiles")
    custom_test_case_templates: List[TestCaseTemplate] = Field(
        alias="customTestCaseTemplates"
    )
    testcases: List[TestCaseV2]
    supported_languages: Set[Language] = Field(alias="supportedLanguages")
    is_public: bool = Field(alias="isPublic")
