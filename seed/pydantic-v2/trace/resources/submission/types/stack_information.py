from pydantic import BaseModel
from typing import Optional
from resources.submission.types import StackFrame


class StackInformation(BaseModel):
    num_stack_frames: int
    top_stack_frame: Optional[StackFrame] = None
