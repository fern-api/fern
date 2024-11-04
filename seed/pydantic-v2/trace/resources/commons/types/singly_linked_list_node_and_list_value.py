from pydantic import BaseModel
from resources.commons.types import SinglyLinkedListValue


class SinglyLinkedListNodeAndListValue(BaseModel):
    node_id: str
    full_list: SinglyLinkedListValue
