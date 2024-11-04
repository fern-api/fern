from pydantic import BaseModel
from typing import Optional


class WithPage(BaseModel):
    page: Optional[int] = None
