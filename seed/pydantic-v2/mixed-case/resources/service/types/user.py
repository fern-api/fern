from pydantic import BaseModel
from typing import List, Dict


class User(BaseModel):
    user_name: str = Field(alias="userName")
    metadata_tags: List[str]
    extra_properties: Dict[str, str] = Field(alias="EXTRA_PROPERTIES")
