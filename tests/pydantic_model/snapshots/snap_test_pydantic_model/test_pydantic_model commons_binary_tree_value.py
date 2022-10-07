import typing

import pydantic
import typing_extensions

from .binary_tree_node_value import BinaryTreeNodeValue
from .node_id import NodeId


class BinaryTreeValue(pydantic.BaseModel):
    root: typing.Optional[NodeId]
    nodes: typing.Dict[NodeId, BinaryTreeNodeValue]

    @pydantic.validator("root")
    def _validate_root(cls, root: typing.Optional[NodeId]) -> typing.Optional[NodeId]:
        for validator in BinaryTreeValue.Validators._root:
            root = validator(root)
        return root

    @pydantic.validator("nodes")
    def _validate_nodes(
        cls, nodes: typing.Dict[NodeId, BinaryTreeNodeValue]
    ) -> typing.Dict[NodeId, BinaryTreeNodeValue]:
        for validator in BinaryTreeValue.Validators._nodes:
            nodes = validator(nodes)
        return nodes

    class Validators:
        _root: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[NodeId]], typing.Optional[NodeId]]]] = []
        _nodes: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.Dict[NodeId, BinaryTreeNodeValue]], typing.Dict[NodeId, BinaryTreeNodeValue]]
            ]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["root"]
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
            [typing.Callable[[typing.Dict[NodeId, BinaryTreeNodeValue]], typing.Dict[NodeId, BinaryTreeNodeValue]]],
            typing.Callable[[typing.Dict[NodeId, BinaryTreeNodeValue]], typing.Dict[NodeId, BinaryTreeNodeValue]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "root":
                    cls._root.append(validator)
                elif field_name == "nodes":
                    cls._nodes.append(validator)
                else:
                    raise RuntimeError("Field does not exist on BinaryTreeValue: " + field_name)

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
