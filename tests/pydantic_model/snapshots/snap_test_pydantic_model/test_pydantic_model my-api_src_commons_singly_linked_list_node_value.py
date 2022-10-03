import typing

import pydantic

from .node_id import NodeId


class SinglyLinkedListNodeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    val: float
    next: typing.Optional[NodeId]

    class Config:
        allow_population_by_field_name = True
