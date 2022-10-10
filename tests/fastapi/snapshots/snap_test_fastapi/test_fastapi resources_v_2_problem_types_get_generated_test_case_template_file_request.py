import typing

import pydantic
import typing_extensions

from .test_case_template import TestCaseTemplate


class GetGeneratedTestCaseTemplateFileRequest(pydantic.BaseModel):
    template: TestCaseTemplate

    @pydantic.validator("template")
    def _validate_template(cls, template: TestCaseTemplate) -> TestCaseTemplate:
        for validator in GetGeneratedTestCaseTemplateFileRequest.Validators._template:
            template = validator(template)
        return template

    class Validators:
        _template: typing.ClassVar[typing.List[typing.Callable[[TestCaseTemplate], TestCaseTemplate]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["template"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseTemplate], TestCaseTemplate]],
            typing.Callable[[TestCaseTemplate], TestCaseTemplate],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "template":
                    cls._template.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetGeneratedTestCaseTemplateFileRequest: " + field_name)

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
