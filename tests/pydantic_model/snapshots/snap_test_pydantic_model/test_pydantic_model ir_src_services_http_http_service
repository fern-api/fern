import typing

import pydantic

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

    class Config:
        allow_population_by_field_name = True
