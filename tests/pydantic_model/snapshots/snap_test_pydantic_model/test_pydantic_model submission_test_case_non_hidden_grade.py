import typing

import pydantic
import typing_extensions

from ..commons.variable_value import VariableValue
from .exception_v_2 import ExceptionV2


class TestCaseNonHiddenGrade(pydantic.BaseModel):
    passed: bool
    actual_result: typing.Optional[VariableValue] = pydantic.Field(alias="actualResult")
    exception: typing.Optional[ExceptionV2]
    stdout: str

    @pydantic.validator("passed")
    def _validate_passed(cls, passed: bool) -> bool:
        for validator in TestCaseNonHiddenGrade.Validators._passed:
            passed = validator(passed)
        return passed

    @pydantic.validator("actual_result")
    def _validate_actual_result(cls, actual_result: typing.Optional[VariableValue]) -> typing.Optional[VariableValue]:
        for validator in TestCaseNonHiddenGrade.Validators._actual_result:
            actual_result = validator(actual_result)
        return actual_result

    @pydantic.validator("exception")
    def _validate_exception(cls, exception: typing.Optional[ExceptionV2]) -> typing.Optional[ExceptionV2]:
        for validator in TestCaseNonHiddenGrade.Validators._exception:
            exception = validator(exception)
        return exception

    @pydantic.validator("stdout")
    def _validate_stdout(cls, stdout: str) -> str:
        for validator in TestCaseNonHiddenGrade.Validators._stdout:
            stdout = validator(stdout)
        return stdout

    class Validators:
        _passed: typing.ClassVar[typing.List[typing.Callable[[bool], bool]]] = []
        _actual_result: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[VariableValue]], typing.Optional[VariableValue]]]
        ] = []
        _exception: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[ExceptionV2]], typing.Optional[ExceptionV2]]]
        ] = []
        _stdout: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["passed"]
        ) -> typing.Callable[[typing.Callable[[bool], bool]], typing.Callable[[bool], bool]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["actual_result"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[VariableValue]], typing.Optional[VariableValue]]],
            typing.Callable[[typing.Optional[VariableValue]], typing.Optional[VariableValue]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["exception"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[ExceptionV2]], typing.Optional[ExceptionV2]]],
            typing.Callable[[typing.Optional[ExceptionV2]], typing.Optional[ExceptionV2]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["stdout"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "passed":
                    cls._passed.append(validator)
                elif field_name == "actual_result":
                    cls._actual_result.append(validator)
                elif field_name == "exception":
                    cls._exception.append(validator)
                elif field_name == "stdout":
                    cls._stdout.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseNonHiddenGrade: " + field_name)

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
