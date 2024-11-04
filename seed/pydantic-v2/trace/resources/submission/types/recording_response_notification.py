from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from resources.submission.types.lightweight_stackframe_information import LightweightStackframeInformation
from resources.submission.types.traced_file import TracedFile
from dt import datetime
from core.datetime_utils import serialize_datetime
class RecordingResponseNotification(BaseModel):
    submission_id: UUID = 
    test_case_id: Optional[str] = 
    line_number: int = 
    lightweight_stack_info: LightweightStackframeInformation = 
    traced_file: Optional[TracedFile] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

