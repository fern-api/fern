from pydantic import BaseModel
from typing import Optional, Dict, Any


class Movie(BaseModel):
    id: str
    prequel: Optional[str] = None
    title: str
    from_: str
    rating: float
    type: str
    tag: str
    book: Optional[str] = None
    metadata: Dict[str, Any]
    revenue: int
