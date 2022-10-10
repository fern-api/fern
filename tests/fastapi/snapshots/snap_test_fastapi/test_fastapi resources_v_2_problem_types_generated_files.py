import typing

import pydantic
import typing_extensions

from ....commons.types.language import Language
from .files import Files


class GeneratedFiles(pydantic.BaseModel):
    generated_test_case_files: typing.Dict[Language, Files] = pydantic.Field(alias="generatedTestCaseFiles")
    generated_template_files: typing.Dict[Language, Files] = pydantic.Field(alias="generatedTemplateFiles")
    other: typing.Dict[Language, Files]

    @pydantic.validator("generated_test_case_files")
    def _validate_generated_test_case_files(
        cls, generated_test_case_files: typing.Dict[Language, Files]
    ) -> typing.Dict[Language, Files]:
        for validator in GeneratedFiles.Validators._generated_test_case_files:
            generated_test_case_files = validator(generated_test_case_files)
        return generated_test_case_files

    @pydantic.validator("generated_template_files")
    def _validate_generated_template_files(
        cls, generated_template_files: typing.Dict[Language, Files]
    ) -> typing.Dict[Language, Files]:
        for validator in GeneratedFiles.Validators._generated_template_files:
            generated_template_files = validator(generated_template_files)
        return generated_template_files

    @pydantic.validator("other")
    def _validate_other(cls, other: typing.Dict[Language, Files]) -> typing.Dict[Language, Files]:
        for validator in GeneratedFiles.Validators._other:
            other = validator(other)
        return other

    class Validators:
        _generated_test_case_files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]]
        ] = []
        _generated_template_files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]]
        ] = []
        _other: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["generated_test_case_files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]],
            typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["generated_template_files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]],
            typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["other"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]],
            typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "generated_test_case_files":
                    cls._generated_test_case_files.append(validator)
                elif field_name == "generated_template_files":
                    cls._generated_template_files.append(validator)
                elif field_name == "other":
                    cls._other.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GeneratedFiles: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
