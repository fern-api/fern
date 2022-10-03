import typing

import pydantic


class FileInfoV2(pydantic.BaseModel):
    filename: str
    directory: str
    contents: str
    editable: bool

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
