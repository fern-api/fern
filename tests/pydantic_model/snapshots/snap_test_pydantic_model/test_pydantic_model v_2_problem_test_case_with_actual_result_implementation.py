import typing

import pydantic
import typing_extensions

from .assert_correctness_check import AssertCorrectnessCheck
from .non_void_function_definition import NonVoidFunctionDefinition


class TestCaseWithActualResultImplementation(pydantic.BaseModel):
    get_actual_result: NonVoidFunctionDefinition = pydantic.Field(alias="getActualResult")
    assert_correctness_check: AssertCorrectnessCheck = pydantic.Field(alias="assertCorrectnessCheck")

    @pydantic.validator("get_actual_result")
    def _validate_get_actual_result(cls, get_actual_result: NonVoidFunctionDefinition) -> NonVoidFunctionDefinition:
        for validator in TestCaseWithActualResultImplementation.Validators._get_actual_result:
            get_actual_result = validator(get_actual_result)
        return get_actual_result

    @pydantic.validator("assert_correctness_check")
    def _validate_assert_correctness_check(
        cls, assert_correctness_check: AssertCorrectnessCheck
    ) -> AssertCorrectnessCheck:
        for validator in TestCaseWithActualResultImplementation.Validators._assert_correctness_check:
            assert_correctness_check = validator(assert_correctness_check)
        return assert_correctness_check

    class Validators:
        _get_actual_result: typing.ClassVar[
            typing.List[typing.Callable[[NonVoidFunctionDefinition], NonVoidFunctionDefinition]]
        ] = []
        _assert_correctness_check: typing.ClassVar[
            typing.List[typing.Callable[[AssertCorrectnessCheck], AssertCorrectnessCheck]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["get_actual_result"]
        ) -> typing.Callable[
            [typing.Callable[[NonVoidFunctionDefinition], NonVoidFunctionDefinition]],
            typing.Callable[[NonVoidFunctionDefinition], NonVoidFunctionDefinition],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["assert_correctness_check"]
        ) -> typing.Callable[
            [typing.Callable[[AssertCorrectnessCheck], AssertCorrectnessCheck]],
            typing.Callable[[AssertCorrectnessCheck], AssertCorrectnessCheck],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "get_actual_result":
                    cls._get_actual_result.append(validator)
                elif field_name == "assert_correctness_check":
                    cls._assert_correctness_check.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseWithActualResultImplementation: " + field_name)

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
