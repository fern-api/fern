from pydantic import BaseModel
from typing import Optional


class GenericValue(BaseModel):
    stringified_type: Optional[str] = Field(alias="stringifiedType", default=None)
    stringified_value: str = Field(alias="stringifiedValue")
