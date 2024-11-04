from pydantic import BaseModel
from resources.commons.types.doubly_linked_list_value import DoublyLinkedListValue


class DoublyLinkedListNodeAndListValue(BaseModel):
    node_id: str = Field(alias="nodeId")
    full_list: DoublyLinkedListValue = Field(alias="fullList")
