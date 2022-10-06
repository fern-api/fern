import typing

import pydantic
import typing_extensions


class ExpressionLocation(pydantic.BaseModel):
    start: int
    offset: int

    @pydantic.validator("start")
    def _validate_start(cls, start: int) -> int:
        for validator in ExpressionLocation.Validators._start:
            start = validator(start)
        return start

    @pydantic.validator("offset")
    def _validate_offset(cls, offset: int) -> int:
        for validator in ExpressionLocation.Validators._offset:
            offset = validator(offset)
        return offset

    class Validators:
        _start: typing.ClassVar[int] = []
        _offset: typing.ClassVar[int] = []

        @typing.overload
        @classmethod
        def field(start: typing_extensions.Literal["start"]) -> int:
            ...

        @typing.overload
        @classmethod
        def field(offset: typing_extensions.Literal["offset"]) -> int:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "start":
                    cls._start.append(validator)  # type: ignore
                elif field_name == "offset":
                    cls._offset.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on ExpressionLocation: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
