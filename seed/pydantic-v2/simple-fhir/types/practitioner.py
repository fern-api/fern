from pydantic import BaseModel
from .types.base_resource import BaseResource


class Practitioner(BaseModel, BaseResource):
    resource_type: str
    name: str
