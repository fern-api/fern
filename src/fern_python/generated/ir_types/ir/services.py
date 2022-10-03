import typing

import pydantic

from ..services.http.http_service import HttpService
from ..services.websocket.web_socket_channel import WebSocketChannel


class Services(pydantic.BaseModel):
    http: typing.List[HttpService]
    websocket: typing.List[WebSocketChannel]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
