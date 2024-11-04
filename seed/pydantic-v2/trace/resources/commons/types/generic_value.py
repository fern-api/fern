from pydantic import BaseModel
from typing import Optional


class GenericValue(BaseModel):
    stringified_type: Optional[str] = None
    stringified_value: str
