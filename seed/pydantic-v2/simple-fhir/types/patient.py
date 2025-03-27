from typing import List

from .types.base_resource import BaseResource
from .types.script import Script
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Patient(BaseModel, BaseResource):
    resource_type: str
    name: str
    scripts: List[Script]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
