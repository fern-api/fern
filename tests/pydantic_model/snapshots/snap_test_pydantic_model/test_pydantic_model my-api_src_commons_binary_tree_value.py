import typing

import pydantic

from .binary_tree_node_value import BinaryTreeNodeValue
from .node_id import NodeId


class BinaryTreeValue(pydantic.BaseModel):
    root: typing.Optional[NodeId]
    nodes: typing.Dict[NodeId, BinaryTreeNodeValue]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
