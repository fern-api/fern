from pydantic import BaseModel
from typing import Optional, Dict
from resources.commons.types.doubly_linked_list_node_value import (
    DoublyLinkedListNodeValue,
)


class DoublyLinkedListValue(BaseModel):
    head: Optional[str] = None
    nodes: Dict[str, DoublyLinkedListNodeValue]
