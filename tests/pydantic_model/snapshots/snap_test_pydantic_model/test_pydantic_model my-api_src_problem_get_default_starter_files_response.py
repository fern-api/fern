import typing

import pydantic
import typing_extensions

from ..commons.language import Language
from .problem_files import ProblemFiles


class GetDefaultStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, ProblemFiles]

    @pydantic.validator("files")
    def _validate_files(cls, files: typing.Dict[Language, ProblemFiles]) -> typing.Dict[Language, ProblemFiles]:
        for validator in GetDefaultStarterFilesResponse.Validators._files:
            files = validator(files)
        return files

    class Validators:
        _files: typing.ClassVar[typing.Dict[Language, ProblemFiles]] = []

        @typing.overload
        @classmethod
        def field(files: typing_extensions.Literal["files"]) -> typing.Dict[Language, ProblemFiles]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "files":
                    cls._files.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetDefaultStarterFilesResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
