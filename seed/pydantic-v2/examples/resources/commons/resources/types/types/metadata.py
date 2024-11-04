from pydantic import BaseModel
from typing import Optional, Dict


class Metadata(BaseModel):
    id: str
    data: Optional[Dict[str, str]] = None
    json_string: Optional[str] = None
