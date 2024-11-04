from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from resources.submission.types import LightweightStackframeInformation, TracedFile


class RecordingResponseNotification(BaseModel):
    submission_id: UUID
    test_case_id: Optional[str] = None
    line_number: int
    lightweight_stack_info: LightweightStackframeInformation
    traced_file: Optional[TracedFile] = None
