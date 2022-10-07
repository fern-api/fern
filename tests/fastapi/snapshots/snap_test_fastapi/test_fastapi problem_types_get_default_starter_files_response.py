import typing

import pydantic
import typing_extensions

from .language import Language
from .problem_files import ProblemFiles


class GetDefaultStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, ProblemFiles]

    @pydantic.validator("files")
    def _validate_files(cls, files: typing.Dict[Language, ProblemFiles]) -> typing.Dict[Language, ProblemFiles]:
        for validator in GetDefaultStarterFilesResponse.Validators._files:
            files = validator(files)
        return files

    class Validators:
        _files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]]],
            typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "files":
                    cls._files.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetDefaultStarterFilesResponse: " + field_name)

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
