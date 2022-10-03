from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .binary_tree_node_and_tree_value import BinaryTreeNodeAndTreeValue
from .doubly_linked_list_node_and_list_value import DoublyLinkedListNodeAndListValue
from .generic_value import GenericValue
from .singly_linked_list_node_and_list_value import SinglyLinkedListNodeAndListValue

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def integer_value(self, value: int) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.IntegerValue(type="integerValue", integer_value=value))

    def boolean_value(self, value: bool) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.BooleanValue(type="booleanValue", boolean_value=value))

    def double_value(self, value: float) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.DoubleValue(type="doubleValue", double_value=value))

    def string_value(self, value: str) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.StringValue(type="stringValue", string_value=value))

    def char_value(self, value: str) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.CharValue(type="charValue", char_value=value))

    def map_value(self, value: DebugMapValue) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.MapValue(**dict(value), type="mapValue"))

    def list_value(self, value: typing.List[DebugVariableValue]) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.ListValue(type="listValue", list_value=value))

    def binary_tree_node_value(self, value: BinaryTreeNodeAndTreeValue) -> DebugVariableValue:
        return DebugVariableValue(
            __root__=_DebugVariableValue.BinaryTreeNodeValue(**dict(value), type="binaryTreeNodeValue")
        )

    def singly_linked_list_node_value(self, value: SinglyLinkedListNodeAndListValue) -> DebugVariableValue:
        return DebugVariableValue(
            __root__=_DebugVariableValue.SinglyLinkedListNodeValue(**dict(value), type="singlyLinkedListNodeValue")
        )

    def doubly_linked_list_node_value(self, value: DoublyLinkedListNodeAndListValue) -> DebugVariableValue:
        return DebugVariableValue(
            __root__=_DebugVariableValue.DoublyLinkedListNodeValue(**dict(value), type="doublyLinkedListNodeValue")
        )

    def undefined_value(self) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.UndefinedValue(type="undefinedValue"))

    def null_value(self) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.NullValue(type="nullValue"))

    def generic_value(self, value: GenericValue) -> DebugVariableValue:
        return DebugVariableValue(__root__=_DebugVariableValue.GenericValue(**dict(value), type="genericValue"))


class DebugVariableValue(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _DebugVariableValue.IntegerValue,
        _DebugVariableValue.BooleanValue,
        _DebugVariableValue.DoubleValue,
        _DebugVariableValue.StringValue,
        _DebugVariableValue.CharValue,
        _DebugVariableValue.MapValue,
        _DebugVariableValue.ListValue,
        _DebugVariableValue.BinaryTreeNodeValue,
        _DebugVariableValue.SinglyLinkedListNodeValue,
        _DebugVariableValue.DoublyLinkedListNodeValue,
        _DebugVariableValue.UndefinedValue,
        _DebugVariableValue.NullValue,
        _DebugVariableValue.GenericValue,
    ]:
        return self.__root__

    def visit(
        self,
        integer_value: typing.Callable[[int], T_Result],
        boolean_value: typing.Callable[[bool], T_Result],
        double_value: typing.Callable[[float], T_Result],
        string_value: typing.Callable[[str], T_Result],
        char_value: typing.Callable[[str], T_Result],
        map_value: typing.Callable[[DebugMapValue], T_Result],
        list_value: typing.Callable[[typing.List[DebugVariableValue]], T_Result],
        binary_tree_node_value: typing.Callable[[BinaryTreeNodeAndTreeValue], T_Result],
        singly_linked_list_node_value: typing.Callable[[SinglyLinkedListNodeAndListValue], T_Result],
        doubly_linked_list_node_value: typing.Callable[[DoublyLinkedListNodeAndListValue], T_Result],
        undefined_value: typing.Callable[[], T_Result],
        null_value: typing.Callable[[], T_Result],
        generic_value: typing.Callable[[GenericValue], T_Result],
    ) -> T_Result:
        if self.__root__.type == "integerValue":
            return integer_value(self.__root__.integer_value)
        if self.__root__.type == "booleanValue":
            return boolean_value(self.__root__.boolean_value)
        if self.__root__.type == "doubleValue":
            return double_value(self.__root__.double_value)
        if self.__root__.type == "stringValue":
            return string_value(self.__root__.string_value)
        if self.__root__.type == "charValue":
            return char_value(self.__root__.char_value)
        if self.__root__.type == "mapValue":
            return map_value(self.__root__)
        if self.__root__.type == "listValue":
            return list_value(self.__root__.list_value)
        if self.__root__.type == "binaryTreeNodeValue":
            return binary_tree_node_value(self.__root__)
        if self.__root__.type == "singlyLinkedListNodeValue":
            return singly_linked_list_node_value(self.__root__)
        if self.__root__.type == "doublyLinkedListNodeValue":
            return doubly_linked_list_node_value(self.__root__)
        if self.__root__.type == "undefinedValue":
            return undefined_value()
        if self.__root__.type == "nullValue":
            return null_value()
        if self.__root__.type == "genericValue":
            return generic_value(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[
            _DebugVariableValue.IntegerValue,
            _DebugVariableValue.BooleanValue,
            _DebugVariableValue.DoubleValue,
            _DebugVariableValue.StringValue,
            _DebugVariableValue.CharValue,
            _DebugVariableValue.MapValue,
            _DebugVariableValue.ListValue,
            _DebugVariableValue.BinaryTreeNodeValue,
            _DebugVariableValue.SinglyLinkedListNodeValue,
            _DebugVariableValue.DoublyLinkedListNodeValue,
            _DebugVariableValue.UndefinedValue,
            _DebugVariableValue.NullValue,
            _DebugVariableValue.GenericValue,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


from .debug_map_value import DebugMapValue  # noqa: E402


class _DebugVariableValue:
    class IntegerValue(pydantic.BaseModel):
        type: typing_extensions.Literal["integerValue"]
        integer_value: int = pydantic.Field(alias="integerValue")

        class Config:
            allow_population_by_field_name = True

    class BooleanValue(pydantic.BaseModel):
        type: typing_extensions.Literal["booleanValue"]
        boolean_value: bool = pydantic.Field(alias="booleanValue")

        class Config:
            allow_population_by_field_name = True

    class DoubleValue(pydantic.BaseModel):
        type: typing_extensions.Literal["doubleValue"]
        double_value: float = pydantic.Field(alias="doubleValue")

        class Config:
            allow_population_by_field_name = True

    class StringValue(pydantic.BaseModel):
        type: typing_extensions.Literal["stringValue"]
        string_value: str = pydantic.Field(alias="stringValue")

        class Config:
            allow_population_by_field_name = True

    class CharValue(pydantic.BaseModel):
        type: typing_extensions.Literal["charValue"]
        char_value: str = pydantic.Field(alias="charValue")

        class Config:
            allow_population_by_field_name = True

    class MapValue(DebugMapValue):
        type: typing_extensions.Literal["mapValue"]

    class ListValue(pydantic.BaseModel):
        type: typing_extensions.Literal["listValue"]
        list_value: typing.List[DebugVariableValue] = pydantic.Field(alias="listValue")

        class Config:
            allow_population_by_field_name = True

    class BinaryTreeNodeValue(BinaryTreeNodeAndTreeValue):
        type: typing_extensions.Literal["binaryTreeNodeValue"]

    class SinglyLinkedListNodeValue(SinglyLinkedListNodeAndListValue):
        type: typing_extensions.Literal["singlyLinkedListNodeValue"]

    class DoublyLinkedListNodeValue(DoublyLinkedListNodeAndListValue):
        type: typing_extensions.Literal["doublyLinkedListNodeValue"]

    class UndefinedValue(pydantic.BaseModel):
        type: typing_extensions.Literal["undefinedValue"]

    class NullValue(pydantic.BaseModel):
        type: typing_extensions.Literal["nullValue"]

    class GenericValue(GenericValue):
        type: typing_extensions.Literal["genericValue"]


DebugVariableValue.update_forward_refs()
