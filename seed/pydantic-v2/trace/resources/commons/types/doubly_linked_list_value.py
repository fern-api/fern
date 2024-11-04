from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types import DoublyLinkedListNodeValue


class DoublyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, DoublyLinkedListNodeValue]
