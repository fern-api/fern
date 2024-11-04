from pydantic import BaseModel
from typing import List


class PlaylistCreateRequest(BaseModel):
    name: str
    problems: List[str]
