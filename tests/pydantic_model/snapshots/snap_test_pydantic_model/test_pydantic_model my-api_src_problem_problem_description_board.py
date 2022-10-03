from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ..commons.variable_value import VariableValue

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def html(self, value: str) -> ProblemDescriptionBoard:
        return ProblemDescriptionBoard(__root__=_ProblemDescriptionBoard.Html(type="html", html=value))

    def variable(self, value: VariableValue) -> ProblemDescriptionBoard:
        return ProblemDescriptionBoard(__root__=_ProblemDescriptionBoard.Variable(type="variable", variable=value))

    def test_case_id(self, value: str) -> ProblemDescriptionBoard:
        return ProblemDescriptionBoard(
            __root__=_ProblemDescriptionBoard.TestCaseId(type="testCaseId", test_case_id=value)
        )


class ProblemDescriptionBoard(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _ProblemDescriptionBoard.Html, _ProblemDescriptionBoard.Variable, _ProblemDescriptionBoard.TestCaseId
    ]:
        return self.__root__

    def visit(
        self,
        html: typing.Callable[[str], T_Result],
        variable: typing.Callable[[VariableValue], T_Result],
        test_case_id: typing.Callable[[str], T_Result],
    ) -> T_Result:
        if self.__root__.type == "html":
            return html(self.__root__.html)
        if self.__root__.type == "variable":
            return variable(self.__root__.variable)
        if self.__root__.type == "testCaseId":
            return test_case_id(self.__root__.test_case_id)

    __root__: typing_extensions.Annotated[
        typing.Union[
            _ProblemDescriptionBoard.Html, _ProblemDescriptionBoard.Variable, _ProblemDescriptionBoard.TestCaseId
        ],
        pydantic.Field(discriminator="type"),
    ]


class _ProblemDescriptionBoard:
    class Html(pydantic.BaseModel):
        type: typing_extensions.Literal["html"]
        html: str

    class Variable(pydantic.BaseModel):
        type: typing_extensions.Literal["variable"]
        variable: VariableValue

    class TestCaseId(pydantic.BaseModel):
        type: typing_extensions.Literal["testCaseId"]
        test_case_id: str = pydantic.Field(alias="testCaseId")

        class Config:
            allow_population_by_field_name = True


ProblemDescriptionBoard.update_forward_refs()
