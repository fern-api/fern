import typing

import pydantic
import typing_extensions

from ...commons.string_with_all_casings import StringWithAllCasings
from ...commons.with_docs import WithDocs
from ..commons.response_errors import ResponseErrors
from ..commons.response_errors_v_2 import ResponseErrorsV2
from .http_endpoint_id import HttpEndpointId
from .http_header import HttpHeader
from .http_method import HttpMethod
from .http_path import HttpPath
from .http_request import HttpRequest
from .http_response import HttpResponse
from .path_parameter import PathParameter
from .query_parameter import QueryParameter


class HttpEndpoint(WithDocs):
    id: HttpEndpointId
    name: StringWithAllCasings
    method: HttpMethod
    headers: typing.List[HttpHeader]
    path: HttpPath
    path_parameters: typing.List[PathParameter] = pydantic.Field(alias="pathParameters")
    query_parameters: typing.List[QueryParameter] = pydantic.Field(alias="queryParameters")
    request: HttpRequest
    response: HttpResponse
    errors: ResponseErrors
    errors_v_2: ResponseErrorsV2 = pydantic.Field(alias="errorsV2")
    auth: bool

    @pydantic.validator("id")
    def _validate_id(cls, id: HttpEndpointId) -> HttpEndpointId:
        for validator in HttpEndpoint.Validators._id:
            id = validator(id)
        return id

    @pydantic.validator("name")
    def _validate_name(cls, name: StringWithAllCasings) -> StringWithAllCasings:
        for validator in HttpEndpoint.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("method")
    def _validate_method(cls, method: HttpMethod) -> HttpMethod:
        for validator in HttpEndpoint.Validators._method:
            method = validator(method)
        return method

    @pydantic.validator("headers")
    def _validate_headers(cls, headers: typing.List[HttpHeader]) -> typing.List[HttpHeader]:
        for validator in HttpEndpoint.Validators._headers:
            headers = validator(headers)
        return headers

    @pydantic.validator("path")
    def _validate_path(cls, path: HttpPath) -> HttpPath:
        for validator in HttpEndpoint.Validators._path:
            path = validator(path)
        return path

    @pydantic.validator("path_parameters")
    def _validate_path_parameters(cls, path_parameters: typing.List[PathParameter]) -> typing.List[PathParameter]:
        for validator in HttpEndpoint.Validators._path_parameters:
            path_parameters = validator(path_parameters)
        return path_parameters

    @pydantic.validator("query_parameters")
    def _validate_query_parameters(cls, query_parameters: typing.List[QueryParameter]) -> typing.List[QueryParameter]:
        for validator in HttpEndpoint.Validators._query_parameters:
            query_parameters = validator(query_parameters)
        return query_parameters

    @pydantic.validator("request")
    def _validate_request(cls, request: HttpRequest) -> HttpRequest:
        for validator in HttpEndpoint.Validators._request:
            request = validator(request)
        return request

    @pydantic.validator("response")
    def _validate_response(cls, response: HttpResponse) -> HttpResponse:
        for validator in HttpEndpoint.Validators._response:
            response = validator(response)
        return response

    @pydantic.validator("errors")
    def _validate_errors(cls, errors: ResponseErrors) -> ResponseErrors:
        for validator in HttpEndpoint.Validators._errors:
            errors = validator(errors)
        return errors

    @pydantic.validator("errors_v_2")
    def _validate_errors_v_2(cls, errors_v_2: ResponseErrorsV2) -> ResponseErrorsV2:
        for validator in HttpEndpoint.Validators._errors_v_2:
            errors_v_2 = validator(errors_v_2)
        return errors_v_2

    @pydantic.validator("auth")
    def _validate_auth(cls, auth: bool) -> bool:
        for validator in HttpEndpoint.Validators._auth:
            auth = validator(auth)
        return auth

    class Validators:
        _id: typing.ClassVar[typing.List[typing.Callable[[HttpEndpointId], HttpEndpointId]]] = []
        _name: typing.ClassVar[typing.List[typing.Callable[[StringWithAllCasings], StringWithAllCasings]]] = []
        _method: typing.ClassVar[typing.List[typing.Callable[[HttpMethod], HttpMethod]]] = []
        _headers: typing.ClassVar[typing.List[typing.Callable[[typing.List[HttpHeader]], typing.List[HttpHeader]]]] = []
        _path: typing.ClassVar[typing.List[typing.Callable[[HttpPath], HttpPath]]] = []
        _path_parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]]]
        ] = []
        _query_parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[QueryParameter]], typing.List[QueryParameter]]]
        ] = []
        _request: typing.ClassVar[typing.List[typing.Callable[[HttpRequest], HttpRequest]]] = []
        _response: typing.ClassVar[typing.List[typing.Callable[[HttpResponse], HttpResponse]]] = []
        _errors: typing.ClassVar[typing.List[typing.Callable[[ResponseErrors], ResponseErrors]]] = []
        _errors_v_2: typing.ClassVar[typing.List[typing.Callable[[ResponseErrorsV2], ResponseErrorsV2]]] = []
        _auth: typing.ClassVar[typing.List[typing.Callable[[bool], bool]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["id"]
        ) -> typing.Callable[
            [typing.Callable[[HttpEndpointId], HttpEndpointId]], typing.Callable[[HttpEndpointId], HttpEndpointId]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[StringWithAllCasings], StringWithAllCasings]],
            typing.Callable[[StringWithAllCasings], StringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["method"]
        ) -> typing.Callable[[typing.Callable[[HttpMethod], HttpMethod]], typing.Callable[[HttpMethod], HttpMethod]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["headers"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[HttpHeader]], typing.List[HttpHeader]]],
            typing.Callable[[typing.List[HttpHeader]], typing.List[HttpHeader]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["path"]
        ) -> typing.Callable[[typing.Callable[[HttpPath], HttpPath]], typing.Callable[[HttpPath], HttpPath]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["path_parameters"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]]],
            typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["query_parameters"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[QueryParameter]], typing.List[QueryParameter]]],
            typing.Callable[[typing.List[QueryParameter]], typing.List[QueryParameter]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["request"]
        ) -> typing.Callable[
            [typing.Callable[[HttpRequest], HttpRequest]], typing.Callable[[HttpRequest], HttpRequest]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["response"]
        ) -> typing.Callable[
            [typing.Callable[[HttpResponse], HttpResponse]], typing.Callable[[HttpResponse], HttpResponse]
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

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["errors_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[ResponseErrorsV2], ResponseErrorsV2]],
            typing.Callable[[ResponseErrorsV2], ResponseErrorsV2],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["auth"]
        ) -> typing.Callable[[typing.Callable[[bool], bool]], typing.Callable[[bool], bool]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "id":
                    cls._id.append(validator)
                elif field_name == "name":
                    cls._name.append(validator)
                elif field_name == "method":
                    cls._method.append(validator)
                elif field_name == "headers":
                    cls._headers.append(validator)
                elif field_name == "path":
                    cls._path.append(validator)
                elif field_name == "path_parameters":
                    cls._path_parameters.append(validator)
                elif field_name == "query_parameters":
                    cls._query_parameters.append(validator)
                elif field_name == "request":
                    cls._request.append(validator)
                elif field_name == "response":
                    cls._response.append(validator)
                elif field_name == "errors":
                    cls._errors.append(validator)
                elif field_name == "errors_v_2":
                    cls._errors_v_2.append(validator)
                elif field_name == "auth":
                    cls._auth.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpEndpoint: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
