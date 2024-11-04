from pydantic import BaseModel
from typing import Optional
from resources.users.types.next_page import NextPage


class Page(BaseModel):
    page: int
    """
    The current page
    """
    next: Optional[NextPage] = None
    per_page: int
    total_page: int
