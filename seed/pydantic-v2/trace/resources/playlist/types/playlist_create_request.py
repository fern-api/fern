from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class PlaylistCreateRequest(BaseModel):
    name: str
    problems: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
