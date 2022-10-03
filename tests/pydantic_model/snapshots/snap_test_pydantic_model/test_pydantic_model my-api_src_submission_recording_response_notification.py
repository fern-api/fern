import typing

import pydantic

from .lightweight_stackframe_information import LightweightStackframeInformation
from .submission_id import SubmissionId
from .traced_file import TracedFile


class RecordingResponseNotification(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    test_case_id: typing.Optional[str] = pydantic.Field(alias="testCaseId")
    line_number: int = pydantic.Field(alias="lineNumber")
    lightweight_stack_info: LightweightStackframeInformation = pydantic.Field(alias="lightweightStackInfo")
    traced_file: typing.Optional[TracedFile] = pydantic.Field(alias="tracedFile")

    class Config:
        allow_population_by_field_name = True
