import typing

import pydantic

from ...commons.string_with_all_casings import StringWithAllCasings
from ...commons.with_docs import WithDocs
from ..commons.response_errors import ResponseErrors
from ..commons.response_errors_v2 import ResponseErrorsV2
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

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
