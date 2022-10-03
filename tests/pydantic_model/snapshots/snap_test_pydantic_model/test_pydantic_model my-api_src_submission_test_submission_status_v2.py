import typing

import pydantic

from ..commons.problem_id import ProblemId
from ..v_2.problem.problem_info_v2 import ProblemInfoV2
from .test_submission_update import TestSubmissionUpdate


class TestSubmissionStatusV2(pydantic.BaseModel):
    updates: typing.List[TestSubmissionUpdate]
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: int = pydantic.Field(alias="problemVersion")
    problem_info: ProblemInfoV2 = pydantic.Field(alias="problemInfo")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
