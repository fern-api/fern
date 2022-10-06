import typing

import pydantic
import typing_extensions

from .file_info_v2 import FileInfoV2


class Files(pydantic.BaseModel):
    files: typing.List[FileInfoV2]

    @pydantic.validator("files")
    def _validate_files(cls, files: typing.List[FileInfoV2]) -> typing.List[FileInfoV2]:
        for validator in Files.Validators._files:
            files = validator(files)
        return files

    class Validators:
        _files: typing.ClassVar[typing.List[FileInfoV2]] = []

        @typing.overload
        @classmethod
        def field(files: typing_extensions.Literal["files"]) -> typing.List[FileInfoV2]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "files":
                    cls._files.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on Files: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
