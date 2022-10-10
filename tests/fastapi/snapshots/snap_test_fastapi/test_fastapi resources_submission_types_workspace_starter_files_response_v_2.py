import typing

import pydantic
import typing_extensions

from ...v_2.problem.types.files import Files
from .language import Language


class WorkspaceStarterFilesResponseV2(pydantic.BaseModel):
    files_by_language: typing.Dict[Language, Files] = pydantic.Field(alias="filesByLanguage")

    @pydantic.validator("files_by_language")
    def _validate_files_by_language(
        cls, files_by_language: typing.Dict[Language, Files]
    ) -> typing.Dict[Language, Files]:
        for validator in WorkspaceStarterFilesResponseV2.Validators._files_by_language:
            files_by_language = validator(files_by_language)
        return files_by_language

    class Validators:
        _files_by_language: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["files_by_language"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]],
            typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "files_by_language":
                    cls._files_by_language.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WorkspaceStarterFilesResponseV2: " + field_name)

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
