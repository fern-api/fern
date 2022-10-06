import typing

import pydantic
import typing_extensions


class TracedFile(pydantic.BaseModel):
    filename: str
    directory: str

    @pydantic.validator("filename")
    def _validate_filename(cls, filename: str) -> str:
        for validator in TracedFile.Validators._filename:
            filename = validator(filename)
        return filename

    @pydantic.validator("directory")
    def _validate_directory(cls, directory: str) -> str:
        for validator in TracedFile.Validators._directory:
            directory = validator(directory)
        return directory

    class Validators:
        _filename: typing.ClassVar[str] = []
        _directory: typing.ClassVar[str] = []

        @typing.overload
        @classmethod
        def field(filename: typing_extensions.Literal["filename"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(directory: typing_extensions.Literal["directory"]) -> str:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "filename":
                    cls._filename.append(validator)  # type: ignore
                elif field_name == "directory":
                    cls._directory.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TracedFile: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
