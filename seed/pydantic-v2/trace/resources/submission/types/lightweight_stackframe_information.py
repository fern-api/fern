from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class LightweightStackframeInformation(BaseModel):
    num_stack_frames: int = 
    top_stack_frame_method_name: str = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

