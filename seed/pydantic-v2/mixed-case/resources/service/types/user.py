from pydantic import BaseModel
from typing import List, Dict
from dt import datetime
from core.datetime_utils import serialize_datetime


class User(BaseModel):
    user_name: str = Field(alias="userName")
    metadata_tags: List[str]
    extra_properties: Dict[str, str] = Field(alias="EXTRA_PROPERTIES")

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
