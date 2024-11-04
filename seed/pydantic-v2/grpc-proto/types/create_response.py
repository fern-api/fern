from pydantic import BaseModel
from typing import Optional
from .types import UserModel


class CreateResponse(BaseModel):
    user: Optional[UserModel] = None
