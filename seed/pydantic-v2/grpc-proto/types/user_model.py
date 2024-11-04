from pydantic import BaseModel
from typing import Optional
from .types import Metadata


class UserModel(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    metadata: Optional[Metadata] = None
