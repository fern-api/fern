from pydantic import BaseModel
from typing import List, Dict


class User(BaseModel):
    user_name: str
    metadata_tags: List[str]
    extra_properties: Dict[str, str]
