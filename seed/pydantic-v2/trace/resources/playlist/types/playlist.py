from pydantic import BaseModel


class Playlist(BaseModel):
    playlist_id: str
    owner_id: str
