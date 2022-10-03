import typing

import pydantic

from .submission_id import SubmissionId
from .test_case_result_with_stdout import TestCaseResultWithStdout


class GradedResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    test_cases: typing.Dict[str, TestCaseResultWithStdout] = pydantic.Field(alias="testCases")

    class Config:
        allow_population_by_field_name = True
