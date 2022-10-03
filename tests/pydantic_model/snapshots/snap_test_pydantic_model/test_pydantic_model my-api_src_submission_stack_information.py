import typing

import pydantic

from .stack_frame import StackFrame


class StackInformation(pydantic.BaseModel):
    num_stack_frames: int = pydantic.Field(alias="numStackFrames")
    top_stack_frame: typing.Optional[StackFrame] = pydantic.Field(alias="topStackFrame")

    class Config:
        allow_population_by_field_name = True
