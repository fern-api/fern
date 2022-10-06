import typing

import pydantic

from ..commons.problem_id import ProblemId
from .submission_id import SubmissionId


class CustomTestCasesUnsupported(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
