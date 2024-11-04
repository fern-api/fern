from pydantic import BaseModel
from typing import Optional
from .types.account import Account


class Memo(BaseModel):
    description: str
    account: Optional[Account] = None
