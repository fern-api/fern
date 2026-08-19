from pydantic import BaseModel
from typing import Optional
from resources.submission.types.stack_frame import StackFrame
from dt import datetime
from core.datetime_utils import serialize_datetime
class StackInformation(BaseModel):
    num_stack_frames: int = 
    top_stack_frame: Optional[StackFrame] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

