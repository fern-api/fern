from pydantic import BaseModel
from resources.problem.types.problem_description import ProblemDescription
from typing import Set, List
from resources.commons.types.language import Language
from resources.v_2.resources.v_3.resources.problem.types.custom_files import CustomFiles
from resources.v_2.resources.v_3.resources.problem.types.generated_files import (
    GeneratedFiles,
)
from resources.v_2.resources.v_3.resources.problem.types.test_case_template import (
    TestCaseTemplate,
)
from resources.v_2.resources.v_3.resources.problem.types.test_case_v_2 import TestCaseV2


class ProblemInfoV2(BaseModel):
    problem_id: str = Field(alias="problemId")
    problem_description: ProblemDescription = Field(alias="problemDescription")
    problem_name: str = Field(alias="problemName")
    problem_version: int = Field(alias="problemVersion")
    supported_languages: Set[Language] = Field(alias="supportedLanguages")
    custom_files: CustomFiles = Field(alias="customFiles")
    generated_files: GeneratedFiles = Field(alias="generatedFiles")
    custom_test_case_templates: List[TestCaseTemplate] = Field(
        alias="customTestCaseTemplates"
    )
    testcases: List[TestCaseV2]
    is_public: bool = Field(alias="isPublic")
