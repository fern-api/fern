import typing

import pydantic

from ...commons.language import Language
from ...problem.problem_description import ProblemDescription
from .custom_files import CustomFiles
from .test_case_template import TestCaseTemplate
from .test_case_v2 import TestCaseV2


class CreateProblemRequestV2(pydantic.BaseModel):
    problem_name: str = pydantic.Field(alias="problemName")
    problem_description: ProblemDescription = pydantic.Field(alias="problemDescription")
    custom_files: CustomFiles = pydantic.Field(alias="customFiles")
    custom_test_case_templates: typing.List[TestCaseTemplate] = pydantic.Field(alias="customTestCaseTemplates")
    testcases: typing.List[TestCaseV2]
    supported_languages: typing.List[Language] = pydantic.Field(alias="supportedLanguages")
    is_public: bool = pydantic.Field(alias="isPublic")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
