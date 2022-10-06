import typing

import pydantic


class LightweightStackframeInformation(pydantic.BaseModel):
    num_stack_frames: int = pydantic.Field(alias="numStackFrames")
    top_stack_frame_method_name: str = pydantic.Field(alias="topStackFrameMethodName")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
