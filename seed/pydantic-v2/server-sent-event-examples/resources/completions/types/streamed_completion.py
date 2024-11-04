from pydantic import BaseModel
from typing import Optional


class StreamedCompletion(BaseModel):
    delta: str
    tokens: Optional[int] = None
