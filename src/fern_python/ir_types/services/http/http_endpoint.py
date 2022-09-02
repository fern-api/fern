from ...commons.with_docs import WithDocs
from .http_endpoint_id import HttpEndpointId
from ...commons.string_with_all_casings import StringWithAllCasings
from .http_method import HttpMethod
from .http_header import HttpHeader
from .http_path import HttpPath
from .path_parameter import PathParameter
from .query_parameter import QueryParameter
from .http_request import HttpRequest
from .http_response import HttpResponse
from ..commons.response_errors import ResponseErrors
import typing
import pydantic


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
    auth: bool
