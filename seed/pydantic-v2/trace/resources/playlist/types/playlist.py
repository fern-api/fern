from pydantic import BaseModel
from resources.playlist.types.playlist_create_request import PlaylistCreateRequest
from dt import datetime
from core.datetime_utils import serialize_datetime
class Playlist(BaseModel, PlaylistCreateRequest):
    playlist_id: str
    owner_id: str = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

