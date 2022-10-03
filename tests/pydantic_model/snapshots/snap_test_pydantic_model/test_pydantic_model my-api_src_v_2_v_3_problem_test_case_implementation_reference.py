from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_case_implementation import TestCaseImplementation
from .test_case_template_id import TestCaseTemplateId

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def template_id(self, value: TestCaseTemplateId) -> TestCaseImplementationReference:
        return TestCaseImplementationReference(
            __root__=_TestCaseImplementationReference.TemplateId(type="templateId", template_id=value)
        )

    def implementation(self, value: TestCaseImplementation) -> TestCaseImplementationReference:
        return TestCaseImplementationReference(
            __root__=_TestCaseImplementationReference.Implementation(**dict(value), type="implementation")
        )


class TestCaseImplementationReference(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[_TestCaseImplementationReference.TemplateId, _TestCaseImplementationReference.Implementation]:
        return self.__root__

    def visit(
        self,
        template_id: typing.Callable[[TestCaseTemplateId], T_Result],
        implementation: typing.Callable[[TestCaseImplementation], T_Result],
    ) -> T_Result:
        if self.__root__.type == "templateId":
            return template_id(self.__root__.template_id)
        if self.__root__.type == "implementation":
            return implementation(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_TestCaseImplementationReference.TemplateId, _TestCaseImplementationReference.Implementation],
        pydantic.Field(discriminator="type"),
    ]


class _TestCaseImplementationReference:
    class TemplateId(pydantic.BaseModel):
        type: typing_extensions.Literal["templateId"]
        template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")

        class Config:
            allow_population_by_field_name = True

    class Implementation(TestCaseImplementation):
        type: typing_extensions.Literal["implementation"]


TestCaseImplementationReference.update_forward_refs()
