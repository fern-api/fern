from pydantic import BaseModel
from .types.base_resource import BaseResource
from typing import List
from .types.script import Script


class Patient(BaseModel, BaseResource):
    resource_type: str
    name: str
    scripts: List[Script]
