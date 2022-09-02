from ...commons.with_docs import WithDocs
from .http_header import HttpHeader
from ..commons.declared_service_name import DeclaredServiceName
from .http_endpoint import HttpEndpoint
import typing
import pydantic


class HttpService(WithDocs):
    name: DeclaredServiceName
    base_path: typing.Optional[str] = pydantic.Field(alias="basePath")
    endpoints: typing.List[HttpEndpoint]
    headers: typing.List[HttpHeader]
