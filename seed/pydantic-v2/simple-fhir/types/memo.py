from pydantic import BaseModel
from typing import Optional
from .types import Account


class Memo(BaseModel):
    description: str
    account: Optional[Account] = None
