import pydantic

from .node_id import NodeId
from .singly_linked_list_value import SinglyLinkedListValue


class SinglyLinkedListNodeAndListValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    full_list: SinglyLinkedListValue = pydantic.Field(alias="fullList")

    class Config:
        allow_population_by_field_name = True
