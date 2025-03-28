from .types.base_resource import BaseResource
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Practitioner(BaseModel, BaseResource):
    resource_type: str
    name: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
