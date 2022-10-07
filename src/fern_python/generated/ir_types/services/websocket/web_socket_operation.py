import typing

import pydantic
import typing_extensions

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

    @pydantic.validator("name")
    def _validate_name(cls, name: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in WebSocketOperation.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("request")
    def _validate_request(cls, request: WebSocketRequest) -> WebSocketRequest:
        for validator in WebSocketOperation.Validators._request:
            request = validator(request)
        return request

    @pydantic.validator("response")
    def _validate_response(cls, response: WebSocketResponse) -> WebSocketResponse:
        for validator in WebSocketOperation.Validators._response:
            response = validator(response)
        return response

    @pydantic.validator("errors")
    def _validate_errors(cls, errors: ResponseErrors) -> ResponseErrors:
        for validator in WebSocketOperation.Validators._errors:
            errors = validator(errors)
        return errors

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]] = []
        _request: typing.ClassVar[typing.List[typing.Callable[[WebSocketRequest], WebSocketRequest]]] = []
        _response: typing.ClassVar[typing.List[typing.Callable[[WebSocketResponse], WebSocketResponse]]] = []
        _errors: typing.ClassVar[typing.List[typing.Callable[[ResponseErrors], ResponseErrors]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["request"]
        ) -> typing.Callable[
            [typing.Callable[[WebSocketRequest], WebSocketRequest]],
            typing.Callable[[WebSocketRequest], WebSocketRequest],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["response"]
        ) -> typing.Callable[
            [typing.Callable[[WebSocketResponse], WebSocketResponse]],
            typing.Callable[[WebSocketResponse], WebSocketResponse],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["errors"]
        ) -> typing.Callable[
            [typing.Callable[[ResponseErrors], ResponseErrors]], typing.Callable[[ResponseErrors], ResponseErrors]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "request":
                    cls._request.append(validator)
                elif field_name == "response":
                    cls._response.append(validator)
                elif field_name == "errors":
                    cls._errors.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WebSocketOperation: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
