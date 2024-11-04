from pydantic import BaseModel
from .types.base_resource import BaseResource
from dt import datetime
from core.datetime_utils import serialize_datetime


class Practitioner(BaseModel, BaseResource):
    resource_type: str
    name: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
