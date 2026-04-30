from pydantic import BaseModel
from .types.base_resource import BaseResource
from typing import Optional
from .types.patient import Patient
from .types.practitioner import Practitioner
from dt import datetime
from core.datetime_utils import serialize_datetime


class Account(BaseModel, BaseResource):
    resource_type: str
    name: str
    patient: Optional[Patient] = None
    practitioner: Optional[Practitioner] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
