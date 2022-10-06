import typing

import pydantic
import typing_extensions

from .test_case_implementation import TestCaseImplementation
from .test_case_template_id import TestCaseTemplateId


class TestCaseTemplate(pydantic.BaseModel):
    template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")
    name: str
    implementation: TestCaseImplementation

    @pydantic.validator("template_id")
    def _validate_template_id(cls, template_id: TestCaseTemplateId) -> TestCaseTemplateId:
        for validator in TestCaseTemplate.Validators._template_id:
            template_id = validator(template_id)
        return template_id

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in TestCaseTemplate.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("implementation")
    def _validate_implementation(cls, implementation: TestCaseImplementation) -> TestCaseImplementation:
        for validator in TestCaseTemplate.Validators._implementation:
            implementation = validator(implementation)
        return implementation

    class Validators:
        _template_id: typing.ClassVar[TestCaseTemplateId] = []
        _name: typing.ClassVar[str] = []
        _implementation: typing.ClassVar[TestCaseImplementation] = []

        @typing.overload
        @classmethod
        def field(template_id: typing_extensions.Literal["template_id"]) -> TestCaseTemplateId:
            ...

        @typing.overload
        @classmethod
        def field(name: typing_extensions.Literal["name"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(implementation: typing_extensions.Literal["implementation"]) -> TestCaseImplementation:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template_id":
                    cls._template_id.append(validator)  # type: ignore
                elif field_name == "name":
                    cls._name.append(validator)  # type: ignore
                elif field_name == "implementation":
                    cls._implementation.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TestCaseTemplate: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
