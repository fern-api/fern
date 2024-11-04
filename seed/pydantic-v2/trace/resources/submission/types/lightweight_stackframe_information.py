from pydantic import BaseModel


class LightweightStackframeInformation(BaseModel):
    num_stack_frames: int = Field(alias="numStackFrames")
    top_stack_frame_method_name: str = Field(alias="topStackFrameMethodName")
