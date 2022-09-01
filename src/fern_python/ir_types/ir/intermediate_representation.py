from pydantic import BaseModel, Field
from ..auth import ApiAuth
from .services import Services
from .fern_constants import FernConstants


class IntermediateRepresentation(BaseModel):
    api_name: str = Field(alias="apiName")
    auth: ApiAuth
    services: Services
    constants: FernConstants
