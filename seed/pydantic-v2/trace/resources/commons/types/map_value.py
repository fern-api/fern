from pydantic import BaseModel
from typing import List
from resources.commons.types import KeyValuePair


class MapValue(BaseModel):
    key_value_pairs: List[KeyValuePair]
