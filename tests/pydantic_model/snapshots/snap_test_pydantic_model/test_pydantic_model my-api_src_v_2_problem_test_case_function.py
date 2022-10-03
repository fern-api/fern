from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_case_with_actual_result_implementation import TestCaseWithActualResultImplementation
from .void_function_definition import VoidFunctionDefinition

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def with_actual_result(self, value: TestCaseWithActualResultImplementation) -> TestCaseFunction:
        return TestCaseFunction(__root__=_TestCaseFunction.WithActualResult(**dict(value), type="withActualResult"))

    def custom(self, value: VoidFunctionDefinition) -> TestCaseFunction:
        return TestCaseFunction(__root__=_TestCaseFunction.Custom(**dict(value), type="custom"))


class TestCaseFunction(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_TestCaseFunction.WithActualResult, _TestCaseFunction.Custom]:
        return self.__root__

    def visit(
        self,
        with_actual_result: typing.Callable[[TestCaseWithActualResultImplementation], T_Result],
        custom: typing.Callable[[VoidFunctionDefinition], T_Result],
    ) -> T_Result:
        if self.__root__.type == "withActualResult":
            return with_actual_result(self.__root__)
        if self.__root__.type == "custom":
            return custom(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_TestCaseFunction.WithActualResult, _TestCaseFunction.Custom], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _TestCaseFunction:
    class WithActualResult(TestCaseWithActualResultImplementation):
        type: typing_extensions.Literal["withActualResult"]

    class Custom(VoidFunctionDefinition):
        type: typing_extensions.Literal["custom"]


TestCaseFunction.update_forward_refs()
