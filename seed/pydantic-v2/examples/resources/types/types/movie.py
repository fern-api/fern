from pydantic import BaseModel
from typing import Optional, Dict, Any


class Movie(BaseModel):
    id: str
    prequel: Optional[str] = None
    title: str
    from_: str = Field(alias="from")
    rating: float
    """
    The rating scale is one to five stars
    """
    type: str
    tag: str
    book: Optional[str] = None
    metadata: Dict[str, Any]
    revenue: int
