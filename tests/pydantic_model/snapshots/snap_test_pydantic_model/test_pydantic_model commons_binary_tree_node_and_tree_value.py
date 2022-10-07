import typing

import pydantic
import typing_extensions

from .binary_tree_value import BinaryTreeValue
from .node_id import NodeId


class BinaryTreeNodeAndTreeValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    full_tree: BinaryTreeValue = pydantic.Field(alias="fullTree")

    @pydantic.validator("node_id")
    def _validate_node_id(cls, node_id: NodeId) -> NodeId:
        for validator in BinaryTreeNodeAndTreeValue.Validators._node_id:
            node_id = validator(node_id)
        return node_id

    @pydantic.validator("full_tree")
    def _validate_full_tree(cls, full_tree: BinaryTreeValue) -> BinaryTreeValue:
        for validator in BinaryTreeNodeAndTreeValue.Validators._full_tree:
            full_tree = validator(full_tree)
        return full_tree

    class Validators:
        _node_id: typing.ClassVar[typing.List[typing.Callable[[NodeId], NodeId]]] = []
        _full_tree: typing.ClassVar[typing.List[typing.Callable[[BinaryTreeValue], BinaryTreeValue]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["node_id"]
        ) -> typing.Callable[[typing.Callable[[NodeId], NodeId]], typing.Callable[[NodeId], NodeId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["full_tree"]
        ) -> typing.Callable[
            [typing.Callable[[BinaryTreeValue], BinaryTreeValue]], typing.Callable[[BinaryTreeValue], BinaryTreeValue]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "node_id":
                    cls._node_id.append(validator)
                elif field_name == "full_tree":
                    cls._full_tree.append(validator)
                else:
                    raise RuntimeError("Field does not exist on BinaryTreeNodeAndTreeValue: " + field_name)

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
