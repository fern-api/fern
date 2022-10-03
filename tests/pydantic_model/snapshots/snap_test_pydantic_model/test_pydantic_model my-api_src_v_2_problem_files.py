import typing

import pydantic

from .file_info_v2 import FileInfoV2


class Files(pydantic.BaseModel):
    files: typing.List[FileInfoV2]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
