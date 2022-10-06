import typing

import pydantic
import typing_extensions

from .doubly_linked_list_value import DoublyLinkedListValue
from .node_id import NodeId


class DoublyLinkedListNodeAndListValue(pydantic.BaseModel):
    node_id: NodeId = pydantic.Field(alias="nodeId")
    full_list: DoublyLinkedListValue = pydantic.Field(alias="fullList")

    @pydantic.validator("node_id")
    def _validate_node_id(cls, node_id: NodeId) -> NodeId:
        for validator in DoublyLinkedListNodeAndListValue.Validators._node_id:
            node_id = validator(node_id)
        return node_id

    @pydantic.validator("full_list")
    def _validate_full_list(cls, full_list: DoublyLinkedListValue) -> DoublyLinkedListValue:
        for validator in DoublyLinkedListNodeAndListValue.Validators._full_list:
            full_list = validator(full_list)
        return full_list

    class Validators:
        _node_id: typing.ClassVar[NodeId] = []
        _full_list: typing.ClassVar[DoublyLinkedListValue] = []

        @typing.overload
        @classmethod
        def field(node_id: typing_extensions.Literal["node_id"]) -> NodeId:
            ...

        @typing.overload
        @classmethod
        def field(full_list: typing_extensions.Literal["full_list"]) -> DoublyLinkedListValue:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "node_id":
                    cls._node_id.append(validator)  # type: ignore
                elif field_name == "full_list":
                    cls._full_list.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on DoublyLinkedListNodeAndListValue: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
