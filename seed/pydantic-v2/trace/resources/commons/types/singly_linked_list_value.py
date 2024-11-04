from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types import SinglyLinkedListNodeValue


class SinglyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, SinglyLinkedListNodeValue]
