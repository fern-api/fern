from pydantic import BaseModel
from typing import List
from resources.commons.types import DebugKeyValuePairs


class DebugMapValue(BaseModel):
    key_value_pairs: List[DebugKeyValuePairs]
