from pydantic import BaseModel
from typing import List, Optional, Dict
from dt import datetime
from core.datetime_utils import serialize_datetime

class ContainerAliasCombinations(BaseModel):
    """Object testing aliases in various container positions."""
    alias_to_list: List[str]
    list_of_aliases: List[str]
    optional_alias: Optional[str]
    map_of_alias_lists: Dict[str, List[str]]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

