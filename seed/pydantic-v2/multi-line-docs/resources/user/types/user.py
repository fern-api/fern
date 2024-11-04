from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    id: str
    name: str
    age: Optional[int] = None
