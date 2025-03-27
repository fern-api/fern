from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


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
