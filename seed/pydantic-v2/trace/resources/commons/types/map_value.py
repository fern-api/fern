from pydantic import BaseModel
from typing import List
from resources.commons.types.key_value_pair import KeyValuePair


class MapValue(BaseModel):
    key_value_pairs: List[KeyValuePair] = Field(alias="keyValuePairs")
