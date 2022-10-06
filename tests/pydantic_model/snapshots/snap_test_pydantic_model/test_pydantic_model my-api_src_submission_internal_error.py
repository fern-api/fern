import typing

import pydantic
import typing_extensions

from .exception_info import ExceptionInfo


class InternalError(pydantic.BaseModel):
    exception_info: ExceptionInfo = pydantic.Field(alias="exceptionInfo")

    @pydantic.validator("exception_info")
    def _validate_exception_info(cls, exception_info: ExceptionInfo) -> ExceptionInfo:
        for validator in InternalError.Validators._exception_info:
            exception_info = validator(exception_info)
        return exception_info

    class Validators:
        _exception_info: typing.ClassVar[ExceptionInfo] = []

        @typing.overload
        @classmethod
        def field(exception_info: typing_extensions.Literal["exception_info"]) -> ExceptionInfo:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "exception_info":
                    cls._exception_info.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on InternalError: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
