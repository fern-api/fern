from pydantic import BaseModel
from typing import Dict


class Record(BaseModel):
    foo: Dict[str, str]
    _3_d: int = Field(alias="3d")
