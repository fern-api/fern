import typing

import pydantic

from ..commons.language import Language
from .workspace_files import WorkspaceFiles


class WorkspaceStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, WorkspaceFiles]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
