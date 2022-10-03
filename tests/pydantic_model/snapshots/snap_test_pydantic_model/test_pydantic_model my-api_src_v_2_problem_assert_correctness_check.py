from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .deep_equality_correctness_check import DeepEqualityCorrectnessCheck
from .void_function_definition_that_takes_actual_result import VoidFunctionDefinitionThatTakesActualResult

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def deep_equality(self, value: DeepEqualityCorrectnessCheck) -> AssertCorrectnessCheck:
        return AssertCorrectnessCheck(__root__=_AssertCorrectnessCheck.DeepEquality(**dict(value), type="deepEquality"))

    def custom(self, value: VoidFunctionDefinitionThatTakesActualResult) -> AssertCorrectnessCheck:
        return AssertCorrectnessCheck(__root__=_AssertCorrectnessCheck.Custom(**dict(value), type="custom"))


class AssertCorrectnessCheck(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_AssertCorrectnessCheck.DeepEquality, _AssertCorrectnessCheck.Custom]:
        return self.__root__

    def visit(
        self,
        deep_equality: typing.Callable[[DeepEqualityCorrectnessCheck], T_Result],
        custom: typing.Callable[[VoidFunctionDefinitionThatTakesActualResult], T_Result],
    ) -> T_Result:
        if self.__root__.type == "deepEquality":
            return deep_equality(self.__root__)
        if self.__root__.type == "custom":
            return custom(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_AssertCorrectnessCheck.DeepEquality, _AssertCorrectnessCheck.Custom],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _AssertCorrectnessCheck:
    class DeepEquality(DeepEqualityCorrectnessCheck):
        type: typing_extensions.Literal["deepEquality"]

    class Custom(VoidFunctionDefinitionThatTakesActualResult):
        type: typing_extensions.Literal["custom"]


AssertCorrectnessCheck.update_forward_refs()
