import typing

import pydantic


class WebSocketOperationProperties(pydantic.BaseModel):
    id: str
    operation: str
    body: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
