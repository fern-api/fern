from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from resources.submission.types.lightweight_stackframe_information import (
    LightweightStackframeInformation,
)
from resources.submission.types.traced_file import TracedFile


class RecordingResponseNotification(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    test_case_id: Optional[str] = Field(alias="testCaseId", default=None)
    line_number: int = Field(alias="lineNumber")
    lightweight_stack_info: LightweightStackframeInformation = Field(
        alias="lightweightStackInfo"
    )
    traced_file: Optional[TracedFile] = Field(alias="tracedFile", default=None)
