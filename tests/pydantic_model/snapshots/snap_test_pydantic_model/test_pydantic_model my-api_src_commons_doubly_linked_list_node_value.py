import typing

import pydantic

from .node_id import NodeId


class DoublyLinkedListNodeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    val: float
    next: typing.Optional[NodeId]
    prev: typing.Optional[NodeId]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
