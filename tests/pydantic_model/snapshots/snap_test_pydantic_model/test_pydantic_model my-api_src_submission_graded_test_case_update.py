import typing

import pydantic

from ..v_2.problem.test_case_id import TestCaseId
from .test_case_grade import TestCaseGrade


class GradedTestCaseUpdate(pydantic.BaseModel):
    test_case_id: TestCaseId = pydantic.Field(alias="testCaseId")
    grade: TestCaseGrade

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
