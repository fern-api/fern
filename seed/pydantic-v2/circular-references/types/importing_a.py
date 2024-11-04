from pydantic import BaseModel
from typing import Optional
from resources.a.types import A


class ImportingA(BaseModel):
    a: Optional[A] = None
