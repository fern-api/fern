import typing

import pydantic
import typing_extensions

from .node_id import NodeId


class BinaryTreeNodeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    val: float
    right: typing.Optional[NodeId]
    left: typing.Optional[NodeId]

    @pydantic.validator("node_id")
    def _validate_node_id(cls, node_id: NodeId) -> NodeId:
        for validator in BinaryTreeNodeValue.Validators._node_id:
            node_id = validator(node_id)
        return node_id

    @pydantic.validator("val")
    def _validate_val(cls, val: float) -> float:
        for validator in BinaryTreeNodeValue.Validators._val:
            val = validator(val)
        return val

    @pydantic.validator("right")
    def _validate_right(cls, right: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in BinaryTreeNodeValue.Validators._right:
            right = validator(right)
        return right

    @pydantic.validator("left")
    def _validate_left(cls, left: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in BinaryTreeNodeValue.Validators._left:
            left = validator(left)
        return left

    class Validators:
        _node_id: typing.ClassVar[typing.List[typing.Callable[[NodeId], NodeId]]] = []
        _val: typing.ClassVar[typing.List[typing.Callable[[float], float]]] = []
        _right: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []
        _left: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []

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
            cls, field_name: typing_extensions.Literal["right"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]],
            typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["left"]
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
                elif field_name == "right":
                    cls._right.append(validator)
                elif field_name == "left":
                    cls._left.append(validator)
                else:
                    raise RuntimeError("Field does not exist on BinaryTreeNodeValue: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
