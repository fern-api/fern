import typing

import pydantic

from ..commons.problem_id import ProblemId
from ..commons.test_case import TestCase
from .test_submission_status import TestSubmissionStatus


class TestSubmissionState(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    default_test_cases: typing.List[TestCase] = pydantic.Field(alias="defaultTestCases")
    custom_test_cases: typing.List[TestCase] = pydantic.Field(alias="customTestCases")
    status: TestSubmissionStatus

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
