from pydantic import BaseModel
from typing import Dict


class ObjectWithMapOfMap(BaseModel):
    map_: Dict[str, Dict[str, str]] = Field(alias="map")
