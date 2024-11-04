from pydantic import BaseModel
from typing import Optional


class StreamResponse(BaseModel):
    id: str
    name: Optional[str] = None
