from pydantic import BaseModel
from typing import List
from dt import datetime
from core.datetime_utils import serialize_datetime
class UpdatePlaylistRequest(BaseModel):
    name: str
    problems: List[str]
    """
    The problems that make up the playlist.
    """
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

