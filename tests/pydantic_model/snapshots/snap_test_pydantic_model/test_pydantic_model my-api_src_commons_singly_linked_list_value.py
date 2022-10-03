import typing

import pydantic

from .node_id import NodeId
from .singly_linked_list_node_value import SinglyLinkedListNodeValue


class SinglyLinkedListValue(pydantic.BaseModel):
    head: typing.Optional[NodeId]
    nodes: typing.Dict[NodeId, SinglyLinkedListNodeValue]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
