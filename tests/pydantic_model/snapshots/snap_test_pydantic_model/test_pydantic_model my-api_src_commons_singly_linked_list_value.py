import typing

import pydantic

from .node_id import NodeId
from .singly_linked_list_node_value import SinglyLinkedListNodeValue


class SinglyLinkedListValue(pydantic.BaseModel):
    head: typing.Optional[NodeId]
    nodes: typing.Dict[NodeId, SinglyLinkedListNodeValue]
