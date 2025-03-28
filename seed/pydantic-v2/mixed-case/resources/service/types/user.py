from typing import Dict, List

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class User(BaseModel):
    user_name: str
    metadata_tags: List[str]
    extra_properties: Dict[str, str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
