from pydantic import BaseModel
from typing import Optional


class ListElement(BaseModel):
    id: Optional[str] = None
