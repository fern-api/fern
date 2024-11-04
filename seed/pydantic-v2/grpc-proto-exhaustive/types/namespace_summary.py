from pydantic import BaseModel
from typing import Optional


class NamespaceSummary(BaseModel):
    count: Optional[int] = None
