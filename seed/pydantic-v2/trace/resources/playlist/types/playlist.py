from pydantic import BaseModel
from resources.playlist.types.playlist_create_request import PlaylistCreateRequest


class Playlist(BaseModel, PlaylistCreateRequest):
    playlist_id: str
    owner_id: str = Field(alias="owner-id")
