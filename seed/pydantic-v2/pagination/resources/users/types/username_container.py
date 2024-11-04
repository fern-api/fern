from pydantic import BaseModel
from typing import List


class UsernameContainer(BaseModel):
    results: List[str]
