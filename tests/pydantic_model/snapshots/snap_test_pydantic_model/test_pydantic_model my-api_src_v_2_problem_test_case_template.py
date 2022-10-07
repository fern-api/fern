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
        _template_id: typing.ClassVar[typing.List[typing.Callable[[TestCaseTemplateId], TestCaseTemplateId]]] = []
        _name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _implementation: typing.ClassVar[
            typing.List[typing.Callable[[TestCaseImplementation], TestCaseImplementation]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["template_id"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseTemplateId], TestCaseTemplateId]],
            typing.Callable[[TestCaseTemplateId], TestCaseTemplateId],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["implementation"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseImplementation], TestCaseImplementation]],
            typing.Callable[[TestCaseImplementation], TestCaseImplementation],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template_id":
                    cls._template_id.append(validator)
                elif field_name == "name":
                    cls._name.append(validator)
                elif field_name == "implementation":
                    cls._implementation.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseTemplate: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
