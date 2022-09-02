import pydantic
import typing
from ..auth import ApiAuth
from . import services
from .fern_constants import FernConstants
from ..types.type_declaration import TypeDeclaration


class IntermediateRepresentation(pydantic.BaseModel):
    api_name: str = pydantic.Field(alias="apiName")
    auth: ApiAuth
    types: typing.List[TypeDeclaration]
    services: services.Services
    constants: FernConstants
