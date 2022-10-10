import typing

import pydantic
import typing_extensions

from .language import Language
from .workspace_files import WorkspaceFiles


class WorkspaceStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, WorkspaceFiles]

    @pydantic.validator("files")
    def _validate_files(cls, files: typing.Dict[Language, WorkspaceFiles]) -> typing.Dict[Language, WorkspaceFiles]:
        for validator in WorkspaceStarterFilesResponse.Validators._files:
            files = validator(files)
        return files

    class Validators:
        _files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, WorkspaceFiles]], typing.Dict[Language, WorkspaceFiles]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, WorkspaceFiles]], typing.Dict[Language, WorkspaceFiles]]],
            typing.Callable[[typing.Dict[Language, WorkspaceFiles]], typing.Dict[Language, WorkspaceFiles]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "files":
                    cls._files.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WorkspaceStarterFilesResponse: " + field_name)

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
