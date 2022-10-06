import typing

import pydantic
import typing_extensions

from .parameter_id import ParameterId
from .test_case_implementation_description import TestCaseImplementationDescription
from .test_case_template_id import TestCaseTemplateId


class BasicTestCaseTemplate(pydantic.BaseModel):
    template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: ParameterId = pydantic.Field(alias="expectedValueParameterId")

    @pydantic.validator("template_id")
    def _validate_template_id(cls, template_id: TestCaseTemplateId) -> TestCaseTemplateId:
        for validator in BasicTestCaseTemplate.Validators._template_id:
            template_id = validator(template_id)
        return template_id

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in BasicTestCaseTemplate.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("description")
    def _validate_description(cls, description: TestCaseImplementationDescription) -> TestCaseImplementationDescription:
        for validator in BasicTestCaseTemplate.Validators._description:
            description = validator(description)
        return description

    @pydantic.validator("expected_value_parameter_id")
    def _validate_expected_value_parameter_id(cls, expected_value_parameter_id: ParameterId) -> ParameterId:
        for validator in BasicTestCaseTemplate.Validators._expected_value_parameter_id:
            expected_value_parameter_id = validator(expected_value_parameter_id)
        return expected_value_parameter_id

    class Validators:
        _template_id: typing.ClassVar[TestCaseTemplateId] = []
        _name: typing.ClassVar[str] = []
        _description: typing.ClassVar[TestCaseImplementationDescription] = []
        _expected_value_parameter_id: typing.ClassVar[ParameterId] = []

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
        def field(description: typing_extensions.Literal["description"]) -> TestCaseImplementationDescription:
            ...

        @typing.overload
        @classmethod
        def field(expected_value_parameter_id: typing_extensions.Literal["expected_value_parameter_id"]) -> ParameterId:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template_id":
                    cls._template_id.append(validator)  # type: ignore
                elif field_name == "name":
                    cls._name.append(validator)  # type: ignore
                elif field_name == "description":
                    cls._description.append(validator)  # type: ignore
                elif field_name == "expected_value_parameter_id":
                    cls._expected_value_parameter_id.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on BasicTestCaseTemplate: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
