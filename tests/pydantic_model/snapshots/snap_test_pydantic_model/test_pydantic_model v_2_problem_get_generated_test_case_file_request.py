import typing

import pydantic
import typing_extensions

from .test_case_template import TestCaseTemplate
from .test_case_v_2 import TestCaseV2


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
        _template: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[TestCaseTemplate]], typing.Optional[TestCaseTemplate]]]
        ] = []
        _test_case: typing.ClassVar[typing.List[typing.Callable[[TestCaseV2], TestCaseV2]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["template"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[TestCaseTemplate]], typing.Optional[TestCaseTemplate]]],
            typing.Callable[[typing.Optional[TestCaseTemplate]], typing.Optional[TestCaseTemplate]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_case"]
        ) -> typing.Callable[[typing.Callable[[TestCaseV2], TestCaseV2]], typing.Callable[[TestCaseV2], TestCaseV2]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template":
                    cls._template.append(validator)
                elif field_name == "test_case":
                    cls._test_case.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetGeneratedTestCaseFileRequest: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
