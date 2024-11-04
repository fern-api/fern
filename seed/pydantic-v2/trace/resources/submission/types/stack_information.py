from pydantic import BaseModel
from typing import Optional
from resources.submission.types.stack_frame import StackFrame


class StackInformation(BaseModel):
    num_stack_frames: int = Field(alias="numStackFrames")
    top_stack_frame: Optional[StackFrame] = Field(alias="topStackFrame", default=None)
