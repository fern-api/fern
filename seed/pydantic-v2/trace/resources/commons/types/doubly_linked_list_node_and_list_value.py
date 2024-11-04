from pydantic import BaseModel
from resources.commons.types.doubly_linked_list_value import DoublyLinkedListValue


class DoublyLinkedListNodeAndListValue(BaseModel):
    node_id: str
    full_list: DoublyLinkedListValue
