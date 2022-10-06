import typing

import pydantic
import typing_extensions

from .test_case_template import TestCaseTemplate
from .test_case_v2 import TestCaseV2


class GetGeneratedTestCaseFileRequest(pydantic.BaseModel):
    template: typing.Optional[TestCaseTemplate]
    test_case: TestCaseV2 = pydantic.Field(alias="testCase")

    @pydantic.validator("template")
    def _validate_template(cls, template: typing.Optional[TestCaseTemplate]) -> typing.Optional[TestCaseTemplate]:
        for validator in GetGeneratedTestCaseFileRequest.Validators._template:
            template = validator(template)
        return template

    @pydantic.validator("test_case")
    def _validate_test_case(cls, test_case: TestCaseV2) -> TestCaseV2:
        for validator in GetGeneratedTestCaseFileRequest.Validators._test_case:
            test_case = validator(test_case)
        return test_case

    class Validators:
        _template: typing.ClassVar[typing.Optional[TestCaseTemplate]] = []
        _test_case: typing.ClassVar[TestCaseV2] = []

        @typing.overload
        @classmethod
        def field(template: typing_extensions.Literal["template"]) -> typing.Optional[TestCaseTemplate]:
            ...

        @typing.overload
        @classmethod
        def field(test_case: typing_extensions.Literal["test_case"]) -> TestCaseV2:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template":
                    cls._template.append(validator)  # type: ignore
                elif field_name == "test_case":
                    cls._test_case.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetGeneratedTestCaseFileRequest: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
