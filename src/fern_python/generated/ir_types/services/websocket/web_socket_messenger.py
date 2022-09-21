import typing

import pydantic

from .web_socket_operation import WebSocketOperation


class WebSocketMessenger(pydantic.BaseModel):
    operations: typing.List[WebSocketOperation]
