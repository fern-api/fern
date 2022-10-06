import typing

import pydantic
import typing_extensions

from .exception_info import ExceptionInfo
from .exception_v2 import ExceptionV2


class WorkspaceRunDetails(pydantic.BaseModel):
    exception_v_2: typing.Optional[ExceptionV2] = pydantic.Field(alias="exceptionV2")
    exception: typing.Optional[ExceptionInfo]
    stdout: str

    @pydantic.validator("exception_v_2")
    def _validate_exception_v_2(cls, exception_v_2: typing.Optional[ExceptionV2]) -> typing.Optional[ExceptionV2]:
        for validator in WorkspaceRunDetails.Validators._exception_v_2:
            exception_v_2 = validator(exception_v_2)
        return exception_v_2

    @pydantic.validator("exception")
    def _validate_exception(cls, exception: typing.Optional[ExceptionInfo]) -> typing.Optional[ExceptionInfo]:
        for validator in WorkspaceRunDetails.Validators._exception:
            exception = validator(exception)
        return exception

    @pydantic.validator("stdout")
    def _validate_stdout(cls, stdout: str) -> str:
        for validator in WorkspaceRunDetails.Validators._stdout:
            stdout = validator(stdout)
        return stdout

    class Validators:
        _exception_v_2: typing.ClassVar[typing.Optional[ExceptionV2]] = []
        _exception: typing.ClassVar[typing.Optional[ExceptionInfo]] = []
        _stdout: typing.ClassVar[str] = []

        @typing.overload
        @classmethod
        def field(exception_v_2: typing_extensions.Literal["exception_v_2"]) -> typing.Optional[ExceptionV2]:
            ...

        @typing.overload
        @classmethod
        def field(exception: typing_extensions.Literal["exception"]) -> typing.Optional[ExceptionInfo]:
            ...

        @typing.overload
        @classmethod
        def field(stdout: typing_extensions.Literal["stdout"]) -> str:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "exception_v_2":
                    cls._exception_v_2.append(validator)  # type: ignore
                elif field_name == "exception":
                    cls._exception.append(validator)  # type: ignore
                elif field_name == "stdout":
                    cls._stdout.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on WorkspaceRunDetails: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
