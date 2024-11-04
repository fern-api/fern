from pydantic import BaseModel
from typing import Dict


class WithMetadata(BaseModel):
    metadata: Dict[str, str]
