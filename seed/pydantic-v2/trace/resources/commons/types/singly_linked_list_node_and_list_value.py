from pydantic import BaseModel
from resources.commons.types.singly_linked_list_value import SinglyLinkedListValue


class SinglyLinkedListNodeAndListValue(BaseModel):
    node_id: str = Field(alias="nodeId")
    full_list: SinglyLinkedListValue = Field(alias="fullList")
