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
        _node_id: typing.ClassVar[typing.List[typing.Callable[[NodeId], NodeId]]] = []
        _val: typing.ClassVar[typing.List[typing.Callable[[float], float]]] = []
        _next: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []
        _prev: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["node_id"]
        ) -> typing.Callable[[typing.Callable[[NodeId], NodeId]], typing.Callable[[NodeId], NodeId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["val"]
        ) -> typing.Callable[[typing.Callable[[float], float]], typing.Callable[[float], float]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["next"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]],
            typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["prev"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]],
            typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "node_id":
                    cls._node_id.append(validator)
                elif field_name == "val":
                    cls._val.append(validator)
                elif field_name == "next":
                    cls._next.append(validator)
                elif field_name == "prev":
                    cls._prev.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DoublyLinkedListNodeValue: " + field_name)

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
        allow_population_by_field_name = True
