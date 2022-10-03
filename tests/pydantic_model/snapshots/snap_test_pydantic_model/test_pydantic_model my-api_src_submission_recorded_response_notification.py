import typing

import pydantic

from .submission_id import SubmissionId


class RecordedResponseNotification(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")
    test_case_id: typing.Optional[str] = pydantic.Field(alias="testCaseId")

    class Config:
        allow_population_by_field_name = True
