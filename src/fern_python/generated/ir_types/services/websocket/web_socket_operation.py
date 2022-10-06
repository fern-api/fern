import typing

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...commons.with_docs import WithDocs
from ..commons.response_errors import ResponseErrors
from .web_socket_request import WebSocketRequest
from .web_socket_response import WebSocketResponse


class WebSocketOperation(WithDocs):
    name: WireStringWithAllCasings
    request: WebSocketRequest
    response: WebSocketResponse
    errors: ResponseErrors

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
