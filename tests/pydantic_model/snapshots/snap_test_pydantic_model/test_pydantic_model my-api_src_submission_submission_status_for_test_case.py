from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_case_grade import TestCaseGrade
from .test_case_result_with_stdout import TestCaseResultWithStdout
from .traced_test_case import TracedTestCase

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def graded(self, value: TestCaseResultWithStdout) -> SubmissionStatusForTestCase:
        return SubmissionStatusForTestCase(__root__=_SubmissionStatusForTestCase.Graded(**dict(value), type="graded"))

    def graded_v_2(self, value: TestCaseGrade) -> SubmissionStatusForTestCase:
        return SubmissionStatusForTestCase(
            __root__=_SubmissionStatusForTestCase.GradedV2(type="gradedV2", graded_v_2=value)
        )

    def traced(self, value: TracedTestCase) -> SubmissionStatusForTestCase:
        return SubmissionStatusForTestCase(__root__=_SubmissionStatusForTestCase.Traced(**dict(value), type="traced"))


class SubmissionStatusForTestCase(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _SubmissionStatusForTestCase.Graded, _SubmissionStatusForTestCase.GradedV2, _SubmissionStatusForTestCase.Traced
    ]:
        return self.__root__

    def visit(
        self,
        graded: typing.Callable[[TestCaseResultWithStdout], T_Result],
        graded_v_2: typing.Callable[[TestCaseGrade], T_Result],
        traced: typing.Callable[[TracedTestCase], T_Result],
    ) -> T_Result:
        if self.__root__.type == "graded":
            return graded(self.__root__)
        if self.__root__.type == "gradedV2":
            return graded_v_2(self.__root__.graded_v_2)
        if self.__root__.type == "traced":
            return traced(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[
            _SubmissionStatusForTestCase.Graded,
            _SubmissionStatusForTestCase.GradedV2,
            _SubmissionStatusForTestCase.Traced,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _SubmissionStatusForTestCase:
    class Graded(TestCaseResultWithStdout):
        type: typing_extensions.Literal["graded"]

    class GradedV2(pydantic.BaseModel):
        type: typing_extensions.Literal["gradedV2"]
        graded_v_2: TestCaseGrade = pydantic.Field(alias="gradedV2")

        class Config:
            allow_population_by_field_name = True

    class Traced(TracedTestCase):
        type: typing_extensions.Literal["traced"]


SubmissionStatusForTestCase.update_forward_refs()
