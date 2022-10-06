from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_case_hidden_grade import TestCaseHiddenGrade
from .test_case_non_hidden_grade import TestCaseNonHiddenGrade

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def hidden(self, value: TestCaseHiddenGrade) -> TestCaseGrade:
        return TestCaseGrade(__root__=_TestCaseGrade.Hidden(**dict(value), type="hidden"))

    def non_hidden(self, value: TestCaseNonHiddenGrade) -> TestCaseGrade:
        return TestCaseGrade(__root__=_TestCaseGrade.NonHidden(**dict(value), type="nonHidden"))


class TestCaseGrade(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_TestCaseGrade.Hidden, _TestCaseGrade.NonHidden]:
        return self.__root__

    def visit(
        self,
        hidden: typing.Callable[[TestCaseHiddenGrade], T_Result],
        non_hidden: typing.Callable[[TestCaseNonHiddenGrade], T_Result],
    ) -> T_Result:
        if self.__root__.type == "hidden":
            return hidden(self.__root__)
        if self.__root__.type == "nonHidden":
            return non_hidden(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_TestCaseGrade.Hidden, _TestCaseGrade.NonHidden], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _TestCaseGrade:
    class Hidden(TestCaseHiddenGrade):
        type: typing_extensions.Literal["hidden"]

        class Config:
            frozen = True

    class NonHidden(TestCaseNonHiddenGrade):
        type: typing_extensions.Literal["nonHidden"]

        class Config:
            frozen = True


TestCaseGrade.update_forward_refs()
