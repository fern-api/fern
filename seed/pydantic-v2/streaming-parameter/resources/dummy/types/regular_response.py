from pydantic import BaseModel
from typing import Optional


class RegularResponse(BaseModel):
    id: str
    name: Optional[str] = None
