from pydantic import BaseModel
from .types.base_resource import BaseResource
from typing import Optional
from .types.patient import Patient
from .types.practitioner import Practitioner


class Account(BaseModel, BaseResource):
    resource_type: str
    name: str
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None
