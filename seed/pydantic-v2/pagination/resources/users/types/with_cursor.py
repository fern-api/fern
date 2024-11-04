from pydantic import BaseModel
from typing import Optional


class WithCursor(BaseModel):
    cursor: Optional[str] = None
