from pydantic import BaseModel
from typing import List


class UpdatePlaylistRequest(BaseModel):
    name: str
    problems: List[str]
