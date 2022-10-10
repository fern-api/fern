import typing

import pydantic
import typing_extensions


class LightweightStackframeInformation(pydantic.BaseModel):
    num_stack_frames: int = pydantic.Field(alias="numStackFrames")
    top_stack_frame_method_name: str = pydantic.Field(alias="topStackFrameMethodName")

    @pydantic.validator("num_stack_frames")
    def _validate_num_stack_frames(cls, num_stack_frames: int) -> int:
        for validator in LightweightStackframeInformation.Validators._num_stack_frames:
            num_stack_frames = validator(num_stack_frames)
        return num_stack_frames

    @pydantic.validator("top_stack_frame_method_name")
    def _validate_top_stack_frame_method_name(cls, top_stack_frame_method_name: str) -> str:
        for validator in LightweightStackframeInformation.Validators._top_stack_frame_method_name:
            top_stack_frame_method_name = validator(top_stack_frame_method_name)
        return top_stack_frame_method_name

    class Validators:
        _num_stack_frames: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []
        _top_stack_frame_method_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["num_stack_frames"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["top_stack_frame_method_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "num_stack_frames":
                    cls._num_stack_frames.append(validator)
                elif field_name == "top_stack_frame_method_name":
                    cls._top_stack_frame_method_name.append(validator)
                else:
                    raise RuntimeError("Field does not exist on LightweightStackframeInformation: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
