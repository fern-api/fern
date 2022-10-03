import typing

import pydantic

from .binary_tree_value import BinaryTreeValue
from .node_id import NodeId


class BinaryTreeNodeAndTreeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    full_tree: BinaryTreeValue = pydantic.Field(alias="fullTree")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
