from pydantic import BaseModel
from typing import Optional


class Pagination(BaseModel):
    next: Optional[str] = None
