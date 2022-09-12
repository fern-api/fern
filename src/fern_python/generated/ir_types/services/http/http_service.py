import typing

import pydantic

from ...commons.with_docs import WithDocs
from ..commons.declared_service_name import DeclaredServiceName
from .http_endpoint import HttpEndpoint
from .http_header import HttpHeader


class HttpService(WithDocs):
    name: DeclaredServiceName
    base_path: typing.Optional[str] = pydantic.Field(alias="basePath")
    endpoints: typing.List[HttpEndpoint]
    headers: typing.List[HttpHeader]
