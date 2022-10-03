import typing

import pydantic

from .file_info_v2 import FileInfoV2


class Files(pydantic.BaseModel):
    files: typing.List[FileInfoV2]
