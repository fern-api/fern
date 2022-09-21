import typing

import pydantic

from ..services.http.http_service import HttpService
from ..services.websocket.web_socket_channel import WebSocketChannel


class Services(pydantic.BaseModel):
    http: typing.List[HttpService]
    websocket: typing.List[WebSocketChannel]
