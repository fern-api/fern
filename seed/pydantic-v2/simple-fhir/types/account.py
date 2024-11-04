from pydantic import BaseModel
from typing import Optional
from .types import Patient, Practitioner


class Account(BaseModel):
    resource_type: str
    name: str
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None
