import typing

import pydantic
import typing_extensions

from ..services.http.http_service import HttpService
from ..services.websocket.web_socket_channel import WebSocketChannel


class Services(pydantic.BaseModel):
    http: typing.List[HttpService]
    websocket: typing.List[WebSocketChannel]

    @pydantic.validator("http")
    def _validate_http(cls, http: typing.List[HttpService]) -> typing.List[HttpService]:
        for validator in Services.Validators._http:
            http = validator(http)
        return http

    @pydantic.validator("websocket")
    def _validate_websocket(cls, websocket: typing.List[WebSocketChannel]) -> typing.List[WebSocketChannel]:
        for validator in Services.Validators._websocket:
            websocket = validator(websocket)
        return websocket

    class Validators:
        _http: typing.ClassVar[typing.List[typing.Callable[[typing.List[HttpService]], typing.List[HttpService]]]] = []
        _websocket: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[WebSocketChannel]], typing.List[WebSocketChannel]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["http"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[HttpService]], typing.List[HttpService]]],
            typing.Callable[[typing.List[HttpService]], typing.List[HttpService]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["websocket"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[WebSocketChannel]], typing.List[WebSocketChannel]]],
            typing.Callable[[typing.List[WebSocketChannel]], typing.List[WebSocketChannel]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "http":
                    cls._http.append(validator)
                elif field_name == "websocket":
                    cls._websocket.append(validator)
                else:
                    raise RuntimeError("Field does not exist on Services: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
