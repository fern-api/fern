from pydantic import BaseModel
from typing import Optional


class Usage(BaseModel):
    units: Optional[int] = None
