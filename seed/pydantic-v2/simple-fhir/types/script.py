from pydantic import BaseModel
from .types.base_resource import BaseResource


class Script(BaseModel, BaseResource):
    resource_type: str
    name: str
