import typing

import pydantic
import typing_extensions

from .test_case import TestCase
from .variable_value import VariableValue


class TestCaseWithExpectedResult(pydantic.BaseModel):
    test_case: TestCase = pydantic.Field(alias="testCase")
    expected_result: VariableValue = pydantic.Field(alias="expectedResult")

    @pydantic.validator("test_case")
    def _validate_test_case(cls, test_case: TestCase) -> TestCase:
        for validator in TestCaseWithExpectedResult.Validators._test_case:
            test_case = validator(test_case)
        return test_case

    @pydantic.validator("expected_result")
    def _validate_expected_result(cls, expected_result: VariableValue) -> VariableValue:
        for validator in TestCaseWithExpectedResult.Validators._expected_result:
            expected_result = validator(expected_result)
        return expected_result

    class Validators:
        _test_case: typing.ClassVar[typing.List[typing.Callable[[TestCase], TestCase]]] = []
        _expected_result: typing.ClassVar[typing.List[typing.Callable[[VariableValue], VariableValue]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_case"]
        ) -> typing.Callable[[typing.Callable[[TestCase], TestCase]], typing.Callable[[TestCase], TestCase]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["expected_result"]
        ) -> typing.Callable[
            [typing.Callable[[VariableValue], VariableValue]], typing.Callable[[VariableValue], VariableValue]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "test_case":
                    cls._test_case.append(validator)
                elif field_name == "expected_result":
                    cls._expected_result.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseWithExpectedResult: " + field_name)

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
