from pydantic import BaseModel
from .types.base_resource import BaseResource
from typing import List
from .types.script import Script
from dt import datetime
from core.datetime_utils import serialize_datetime


class Patient(BaseModel, BaseResource):
    resource_type: str
    name: str
    scripts: List[Script]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
