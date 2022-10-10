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
        _head: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []
        _nodes: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.Dict[NodeId, DoublyLinkedListNodeValue]], typing.Dict[NodeId, DoublyLinkedListNodeValue]
                ]
            ]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["head"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]],
            typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["nodes"]
        ) -> typing.Callable[
            [
                typing.Callable[
                    [typing.Dict[NodeId, DoublyLinkedListNodeValue]], typing.Dict[NodeId, DoublyLinkedListNodeValue]
                ]
            ],
            typing.Callable[
                [typing.Dict[NodeId, DoublyLinkedListNodeValue]], typing.Dict[NodeId, DoublyLinkedListNodeValue]
            ],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "head":
                    cls._head.append(validator)
                elif field_name == "nodes":
                    cls._nodes.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DoublyLinkedListValue: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
