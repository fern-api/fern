from pydantic import BaseModel
from typing import List
from resources.commons.types.debug_key_value_pairs import DebugKeyValuePairs


class DebugMapValue(BaseModel):
    key_value_pairs: List[DebugKeyValuePairs] = Field(alias="keyValuePairs")
