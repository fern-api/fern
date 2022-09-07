import typing

import pydantic

from ..auth import ApiAuth
from ..types.type_declaration import TypeDeclaration
from . import services
from .fern_constants import FernConstants


class IntermediateRepresentation(pydantic.BaseModel):
    api_name: str = pydantic.Field(alias="apiName")
    auth: ApiAuth
    types: typing.List[TypeDeclaration]
    services: services.Services
    constants: FernConstants
