import typing

import pydantic
import typing_extensions

from ...commons.with_docs import WithDocs
from ..commons.declared_service_name import DeclaredServiceName
from .web_socket_messenger import WebSocketMessenger
from .web_socket_operation_properties import WebSocketOperationProperties


class WebSocketChannel(WithDocs):
    name: DeclaredServiceName
    path: str
    client: WebSocketMessenger
    server: WebSocketMessenger
    operation_properties: WebSocketOperationProperties = pydantic.Field(alias="operationProperties")

    @pydantic.validator("name")
    def _validate_name(cls, name: DeclaredServiceName) -> DeclaredServiceName:
        for validator in WebSocketChannel.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("path")
    def _validate_path(cls, path: str) -> str:
        for validator in WebSocketChannel.Validators._path:
            path = validator(path)
        return path

    @pydantic.validator("client")
    def _validate_client(cls, client: WebSocketMessenger) -> WebSocketMessenger:
        for validator in WebSocketChannel.Validators._client:
            client = validator(client)
        return client

    @pydantic.validator("server")
    def _validate_server(cls, server: WebSocketMessenger) -> WebSocketMessenger:
        for validator in WebSocketChannel.Validators._server:
            server = validator(server)
        return server

    @pydantic.validator("operation_properties")
    def _validate_operation_properties(
        cls, operation_properties: WebSocketOperationProperties
    ) -> WebSocketOperationProperties:
        for validator in WebSocketChannel.Validators._operation_properties:
            operation_properties = validator(operation_properties)
        return operation_properties

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[DeclaredServiceName], DeclaredServiceName]]] = []
        _path: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _client: typing.ClassVar[typing.List[typing.Callable[[WebSocketMessenger], WebSocketMessenger]]] = []
        _server: typing.ClassVar[typing.List[typing.Callable[[WebSocketMessenger], WebSocketMessenger]]] = []
        _operation_properties: typing.ClassVar[
            typing.List[typing.Callable[[WebSocketOperationProperties], WebSocketOperationProperties]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[DeclaredServiceName], DeclaredServiceName]],
            typing.Callable[[DeclaredServiceName], DeclaredServiceName],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["path"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["client"]
        ) -> typing.Callable[
            [typing.Callable[[WebSocketMessenger], WebSocketMessenger]],
            typing.Callable[[WebSocketMessenger], WebSocketMessenger],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["server"]
        ) -> typing.Callable[
            [typing.Callable[[WebSocketMessenger], WebSocketMessenger]],
            typing.Callable[[WebSocketMessenger], WebSocketMessenger],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["operation_properties"]
        ) -> typing.Callable[
            [typing.Callable[[WebSocketOperationProperties], WebSocketOperationProperties]],
            typing.Callable[[WebSocketOperationProperties], WebSocketOperationProperties],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "path":
                    cls._path.append(validator)
                elif field_name == "client":
                    cls._client.append(validator)
                elif field_name == "server":
                    cls._server.append(validator)
                elif field_name == "operation_properties":
                    cls._operation_properties.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WebSocketChannel: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
