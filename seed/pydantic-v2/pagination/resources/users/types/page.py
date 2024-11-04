from pydantic import BaseModel
from typing import Optional
from resources.users.types import NextPage


class Page(BaseModel):
    page: int
    next: Optional[NextPage] = None
    per_page: int
    total_page: int
