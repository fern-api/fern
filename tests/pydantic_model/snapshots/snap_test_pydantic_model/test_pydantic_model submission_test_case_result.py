import typing

import pydantic
import typing_extensions

from ..commons.variable_value import VariableValue
from .actual_result import ActualResult


class TestCaseResult(pydantic.BaseModel):
    expected_result: VariableValue = pydantic.Field(alias="expectedResult")
    actual_result: ActualResult = pydantic.Field(alias="actualResult")
    passed: bool

    @pydantic.validator("expected_result")
    def _validate_expected_result(cls, expected_result: VariableValue) -> VariableValue:
        for validator in TestCaseResult.Validators._expected_result:
            expected_result = validator(expected_result)
        return expected_result

    @pydantic.validator("actual_result")
    def _validate_actual_result(cls, actual_result: ActualResult) -> ActualResult:
        for validator in TestCaseResult.Validators._actual_result:
            actual_result = validator(actual_result)
        return actual_result

    @pydantic.validator("passed")
    def _validate_passed(cls, passed: bool) -> bool:
        for validator in TestCaseResult.Validators._passed:
            passed = validator(passed)
        return passed

    class Validators:
        _expected_result: typing.ClassVar[typing.List[typing.Callable[[VariableValue], VariableValue]]] = []
        _actual_result: typing.ClassVar[typing.List[typing.Callable[[ActualResult], ActualResult]]] = []
        _passed: typing.ClassVar[typing.List[typing.Callable[[bool], bool]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["expected_result"]
        ) -> typing.Callable[
            [typing.Callable[[VariableValue], VariableValue]], typing.Callable[[VariableValue], VariableValue]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["actual_result"]
        ) -> typing.Callable[
            [typing.Callable[[ActualResult], ActualResult]], typing.Callable[[ActualResult], ActualResult]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["passed"]
        ) -> typing.Callable[[typing.Callable[[bool], bool]], typing.Callable[[bool], bool]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "expected_result":
                    cls._expected_result.append(validator)
                elif field_name == "actual_result":
                    cls._actual_result.append(validator)
                elif field_name == "passed":
                    cls._passed.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseResult: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
