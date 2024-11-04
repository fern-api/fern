from pydantic import BaseModel
from typing import Any


class Metadata(BaseModel):
    id: str
    value: Any
