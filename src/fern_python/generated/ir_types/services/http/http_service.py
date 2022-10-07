import typing

import pydantic
import typing_extensions

from ...commons.with_docs import WithDocs
from ..commons.declared_service_name import DeclaredServiceName
from .http_endpoint import HttpEndpoint
from .http_header import HttpHeader
from .http_path import HttpPath
from .path_parameter import PathParameter


class HttpService(WithDocs):
    name: DeclaredServiceName
    base_path: typing.Optional[str] = pydantic.Field(alias="basePath")
    base_path_v_2: typing.Optional[HttpPath] = pydantic.Field(alias="basePathV2")
    endpoints: typing.List[HttpEndpoint]
    headers: typing.List[HttpHeader]
    path_parameters: typing.List[PathParameter] = pydantic.Field(alias="pathParameters")

    @pydantic.validator("name")
    def _validate_name(cls, name: DeclaredServiceName) -> DeclaredServiceName:
        for validator in HttpService.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("base_path")
    def _validate_base_path(cls, base_path: typing.Optional[str]) -> typing.Optional[str]:
        for validator in HttpService.Validators._base_path:
            base_path = validator(base_path)
        return base_path

    @pydantic.validator("base_path_v_2")
    def _validate_base_path_v_2(cls, base_path_v_2: typing.Optional[HttpPath]) -> typing.Optional[HttpPath]:
        for validator in HttpService.Validators._base_path_v_2:
            base_path_v_2 = validator(base_path_v_2)
        return base_path_v_2

    @pydantic.validator("endpoints")
    def _validate_endpoints(cls, endpoints: typing.List[HttpEndpoint]) -> typing.List[HttpEndpoint]:
        for validator in HttpService.Validators._endpoints:
            endpoints = validator(endpoints)
        return endpoints

    @pydantic.validator("headers")
    def _validate_headers(cls, headers: typing.List[HttpHeader]) -> typing.List[HttpHeader]:
        for validator in HttpService.Validators._headers:
            headers = validator(headers)
        return headers

    @pydantic.validator("path_parameters")
    def _validate_path_parameters(cls, path_parameters: typing.List[PathParameter]) -> typing.List[PathParameter]:
        for validator in HttpService.Validators._path_parameters:
            path_parameters = validator(path_parameters)
        return path_parameters

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[DeclaredServiceName], DeclaredServiceName]]] = []
        _base_path: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]] = []
        _base_path_v_2: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[HttpPath]], typing.Optional[HttpPath]]]
        ] = []
        _endpoints: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[HttpEndpoint]], typing.List[HttpEndpoint]]]
        ] = []
        _headers: typing.ClassVar[typing.List[typing.Callable[[typing.List[HttpHeader]], typing.List[HttpHeader]]]] = []
        _path_parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]]]
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
            cls, field_name: typing_extensions.Literal["base_path"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["base_path_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[HttpPath]], typing.Optional[HttpPath]]],
            typing.Callable[[typing.Optional[HttpPath]], typing.Optional[HttpPath]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["endpoints"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[HttpEndpoint]], typing.List[HttpEndpoint]]],
            typing.Callable[[typing.List[HttpEndpoint]], typing.List[HttpEndpoint]],
        ]:
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
            cls, field_name: typing_extensions.Literal["path_parameters"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]]],
            typing.Callable[[typing.List[PathParameter]], typing.List[PathParameter]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "base_path":
                    cls._base_path.append(validator)
                elif field_name == "base_path_v_2":
                    cls._base_path_v_2.append(validator)
                elif field_name == "endpoints":
                    cls._endpoints.append(validator)
                elif field_name == "headers":
                    cls._headers.append(validator)
                elif field_name == "path_parameters":
                    cls._path_parameters.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpService: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
