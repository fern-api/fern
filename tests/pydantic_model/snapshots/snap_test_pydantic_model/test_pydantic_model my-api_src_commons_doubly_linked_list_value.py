import typing

import pydantic
import typing_extensions

from .doubly_linked_list_node_value import DoublyLinkedListNodeValue
from .node_id import NodeId


class DoublyLinkedListValue(pydantic.BaseModel):
    head: typing.Optional[NodeId]
    nodes: typing.Dict[NodeId, DoublyLinkedListNodeValue]

    @pydantic.validator("head")
    def _validate_head(cls, head: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in DoublyLinkedListValue.Validators._head:
            head = validator(head)
        return head

    @pydantic.validator("nodes")
    def _validate_nodes(
        cls, nodes: typing.Dict[NodeId, DoublyLinkedListNodeValue]
    ) -> typing.Dict[NodeId, DoublyLinkedListNodeValue]:
        for validator in DoublyLinkedListValue.Validators._nodes:
            nodes = validator(nodes)
        return nodes

    class Validators:
        _head: typing.ClassVar[typing.Optional[NodeId]] = []
        _nodes: typing.ClassVar[typing.Dict[NodeId, DoublyLinkedListNodeValue]] = []

        @typing.overload
        @classmethod
        def field(head: typing_extensions.Literal["head"]) -> typing.Optional[NodeId]:
            ...

        @typing.overload
        @classmethod
        def field(nodes: typing_extensions.Literal["nodes"]) -> typing.Dict[NodeId, DoublyLinkedListNodeValue]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "head":
                    cls._head.append(validator)  # type: ignore
                elif field_name == "nodes":
                    cls._nodes.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on DoublyLinkedListValue: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
