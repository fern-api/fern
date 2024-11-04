from pydantic import BaseModel
from typing import Optional
from .types.user_model import UserModel


class CreateResponse(BaseModel):
    user: Optional[UserModel] = None
