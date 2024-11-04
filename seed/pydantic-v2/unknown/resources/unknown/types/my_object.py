from pydantic import BaseModel
from typing import Any


class MyObject(BaseModel):
    unknown: Any
