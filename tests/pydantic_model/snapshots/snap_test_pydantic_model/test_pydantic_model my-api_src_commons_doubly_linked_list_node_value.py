import typing

import pydantic
import typing_extensions

from .node_id import NodeId


class DoublyLinkedListNodeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    val: float
    next: typing.Optional[NodeId]
    prev: typing.Optional[NodeId]

    @pydantic.validator("node_id")
    def _validate_node_id(cls, node_id: NodeId) -> NodeId:
        for validator in DoublyLinkedListNodeValue.Validators._node_id:
            node_id = validator(node_id)
        return node_id

    @pydantic.validator("val")
    def _validate_val(cls, val: float) -> float:
        for validator in DoublyLinkedListNodeValue.Validators._val:
            val = validator(val)
        return val

    @pydantic.validator("next")
    def _validate_next(cls, next: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in DoublyLinkedListNodeValue.Validators._next:
            next = validator(next)
        return next

    @pydantic.validator("prev")
    def _validate_prev(cls, prev: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in DoublyLinkedListNodeValue.Validators._prev:
            prev = validator(prev)
        return prev

    class Validators:
        _node_id: typing.ClassVar[NodeId] = []
        _val: typing.ClassVar[float] = []
        _next: typing.ClassVar[typing.Optional[NodeId]] = []
        _prev: typing.ClassVar[typing.Optional[NodeId]] = []

        @typing.overload
        @classmethod
        def field(node_id: typing_extensions.Literal["node_id"]) -> NodeId:
            ...

        @typing.overload
        @classmethod
        def field(val: typing_extensions.Literal["val"]) -> float:
            ...

        @typing.overload
        @classmethod
        def field(next: typing_extensions.Literal["next"]) -> typing.Optional[NodeId]:
            ...

        @typing.overload
        @classmethod
        def field(prev: typing_extensions.Literal["prev"]) -> typing.Optional[NodeId]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "node_id":
                    cls._node_id.append(validator)  # type: ignore
                elif field_name == "val":
                    cls._val.append(validator)  # type: ignore
                elif field_name == "next":
                    cls._next.append(validator)  # type: ignore
                elif field_name == "prev":
                    cls._prev.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on DoublyLinkedListNodeValue: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
