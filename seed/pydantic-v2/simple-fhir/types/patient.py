from pydantic import BaseModel
from typing import List
from .types import Script


class Patient(BaseModel):
    resource_type: str
    name: str
    scripts: List[Script]
