import typing

import pydantic
import typing_extensions


class ExceptionInfo(pydantic.BaseModel):
    exception_type: str = pydantic.Field(alias="exceptionType")
    exception_message: str = pydantic.Field(alias="exceptionMessage")
    exception_stacktrace: str = pydantic.Field(alias="exceptionStacktrace")

    @pydantic.validator("exception_type")
    def _validate_exception_type(cls, exception_type: str) -> str:
        for validator in ExceptionInfo.Validators._exception_type:
            exception_type = validator(exception_type)
        return exception_type

    @pydantic.validator("exception_message")
    def _validate_exception_message(cls, exception_message: str) -> str:
        for validator in ExceptionInfo.Validators._exception_message:
            exception_message = validator(exception_message)
        return exception_message

    @pydantic.validator("exception_stacktrace")
    def _validate_exception_stacktrace(cls, exception_stacktrace: str) -> str:
        for validator in ExceptionInfo.Validators._exception_stacktrace:
            exception_stacktrace = validator(exception_stacktrace)
        return exception_stacktrace

    class Validators:
        _exception_type: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _exception_message: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _exception_stacktrace: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["exception_type"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["exception_message"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["exception_stacktrace"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "exception_type":
                    cls._exception_type.append(validator)
                elif field_name == "exception_message":
                    cls._exception_message.append(validator)
                elif field_name == "exception_stacktrace":
                    cls._exception_stacktrace.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ExceptionInfo: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
