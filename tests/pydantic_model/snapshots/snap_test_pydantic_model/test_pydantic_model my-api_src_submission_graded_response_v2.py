import typing

import pydantic

from ..v_2.problem.test_case_id import TestCaseId
from .submission_id import SubmissionId
from .test_case_grade import TestCaseGrade


class GradedResponseV2(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    test_cases: typing.Dict[TestCaseId, TestCaseGrade] = pydantic.Field(alias="testCases")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
