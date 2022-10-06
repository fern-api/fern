import typing

import pydantic
import typing_extensions


class FileInfoV2(pydantic.BaseModel):
    filename: str
    directory: str
    contents: str
    editable: bool

    @pydantic.validator("filename")
    def _validate_filename(cls, filename: str) -> str:
        for validator in FileInfoV2.Validators._filename:
            filename = validator(filename)
        return filename

    @pydantic.validator("directory")
    def _validate_directory(cls, directory: str) -> str:
        for validator in FileInfoV2.Validators._directory:
            directory = validator(directory)
        return directory

    @pydantic.validator("contents")
    def _validate_contents(cls, contents: str) -> str:
        for validator in FileInfoV2.Validators._contents:
            contents = validator(contents)
        return contents

    @pydantic.validator("editable")
    def _validate_editable(cls, editable: bool) -> bool:
        for validator in FileInfoV2.Validators._editable:
            editable = validator(editable)
        return editable

    class Validators:
        _filename: typing.ClassVar[str] = []
        _directory: typing.ClassVar[str] = []
        _contents: typing.ClassVar[str] = []
        _editable: typing.ClassVar[bool] = []

        @typing.overload
        @classmethod
        def field(filename: typing_extensions.Literal["filename"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(directory: typing_extensions.Literal["directory"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(contents: typing_extensions.Literal["contents"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(editable: typing_extensions.Literal["editable"]) -> bool:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "filename":
                    cls._filename.append(validator)  # type: ignore
                elif field_name == "directory":
                    cls._directory.append(validator)  # type: ignore
                elif field_name == "contents":
                    cls._contents.append(validator)  # type: ignore
                elif field_name == "editable":
                    cls._editable.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on FileInfoV2: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
