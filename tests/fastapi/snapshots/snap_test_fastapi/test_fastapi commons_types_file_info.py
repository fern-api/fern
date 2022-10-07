import typing

import pydantic
import typing_extensions


class FileInfo(pydantic.BaseModel):
    filename: str
    contents: str

    @pydantic.validator("filename")
    def _validate_filename(cls, filename: str) -> str:
        for validator in FileInfo.Validators._filename:
            filename = validator(filename)
        return filename

    @pydantic.validator("contents")
    def _validate_contents(cls, contents: str) -> str:
        for validator in FileInfo.Validators._contents:
            contents = validator(contents)
        return contents

    class Validators:
        _filename: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _contents: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["filename"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["contents"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "filename":
                    cls._filename.append(validator)
                elif field_name == "contents":
                    cls._contents.append(validator)
                else:
                    raise RuntimeError("Field does not exist on FileInfo: " + field_name)

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
