from pydantic import BaseModel
from typing import Optional, List


class UsernamePage(BaseModel):
    after: Optional[str] = None
    data: List[str]
