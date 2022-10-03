from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .parameter_id import ParameterId

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def html(self, value: str) -> TestCaseImplementationDescriptionBoard:
        return TestCaseImplementationDescriptionBoard(
            __root__=_TestCaseImplementationDescriptionBoard.Html(type="html", html=value)
        )

    def param_id(self, value: ParameterId) -> TestCaseImplementationDescriptionBoard:
        return TestCaseImplementationDescriptionBoard(
            __root__=_TestCaseImplementationDescriptionBoard.ParamId(type="paramId", param_id=value)
        )


class TestCaseImplementationDescriptionBoard(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[_TestCaseImplementationDescriptionBoard.Html, _TestCaseImplementationDescriptionBoard.ParamId]:
        return self.__root__

    def visit(
        self, html: typing.Callable[[str], T_Result], param_id: typing.Callable[[ParameterId], T_Result]
    ) -> T_Result:
        if self.__root__.type == "html":
            return html(self.__root__.html)
        if self.__root__.type == "paramId":
            return param_id(self.__root__.param_id)

    __root__: typing_extensions.Annotated[
        typing.Union[_TestCaseImplementationDescriptionBoard.Html, _TestCaseImplementationDescriptionBoard.ParamId],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _TestCaseImplementationDescriptionBoard:
    class Html(pydantic.BaseModel):
        type: typing_extensions.Literal["html"]
        html: str

    class ParamId(pydantic.BaseModel):
        type: typing_extensions.Literal["paramId"]
        param_id: ParameterId = pydantic.Field(alias="paramId")

        class Config:
            allow_population_by_field_name = True


TestCaseImplementationDescriptionBoard.update_forward_refs()
