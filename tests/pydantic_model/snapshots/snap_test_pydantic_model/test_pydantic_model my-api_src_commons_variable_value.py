from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .binary_tree_value import BinaryTreeValue
from .doubly_linked_list_value import DoublyLinkedListValue
from .singly_linked_list_value import SinglyLinkedListValue

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def integer_value(self, value: int) -> VariableValue:
        return VariableValue(__root__=_VariableValue.IntegerValue(type="integerValue", integer_value=value))

    def boolean_value(self, value: bool) -> VariableValue:
        return VariableValue(__root__=_VariableValue.BooleanValue(type="booleanValue", boolean_value=value))

    def double_value(self, value: float) -> VariableValue:
        return VariableValue(__root__=_VariableValue.DoubleValue(type="doubleValue", double_value=value))

    def string_value(self, value: str) -> VariableValue:
        return VariableValue(__root__=_VariableValue.StringValue(type="stringValue", string_value=value))

    def char_value(self, value: str) -> VariableValue:
        return VariableValue(__root__=_VariableValue.CharValue(type="charValue", char_value=value))

    def map_value(self, value: MapValue) -> VariableValue:
        return VariableValue(__root__=_VariableValue.MapValue(**dict(value), type="mapValue"))

    def list_value(self, value: typing.List[VariableValue]) -> VariableValue:
        return VariableValue(__root__=_VariableValue.ListValue(type="listValue", list_value=value))

    def binary_tree_value(self, value: BinaryTreeValue) -> VariableValue:
        return VariableValue(__root__=_VariableValue.BinaryTreeValue(**dict(value), type="binaryTreeValue"))

    def singly_linked_list_value(self, value: SinglyLinkedListValue) -> VariableValue:
        return VariableValue(__root__=_VariableValue.SinglyLinkedListValue(**dict(value), type="singlyLinkedListValue"))

    def doubly_linked_list_value(self, value: DoublyLinkedListValue) -> VariableValue:
        return VariableValue(__root__=_VariableValue.DoublyLinkedListValue(**dict(value), type="doublyLinkedListValue"))

    def null_value(self) -> VariableValue:
        return VariableValue(__root__=_VariableValue.NullValue(type="nullValue"))


class VariableValue(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _VariableValue.IntegerValue,
        _VariableValue.BooleanValue,
        _VariableValue.DoubleValue,
        _VariableValue.StringValue,
        _VariableValue.CharValue,
        _VariableValue.MapValue,
        _VariableValue.ListValue,
        _VariableValue.BinaryTreeValue,
        _VariableValue.SinglyLinkedListValue,
        _VariableValue.DoublyLinkedListValue,
        _VariableValue.NullValue,
    ]:
        return self.__root__

    def visit(
        self,
        integer_value: typing.Callable[[int], T_Result],
        boolean_value: typing.Callable[[bool], T_Result],
        double_value: typing.Callable[[float], T_Result],
        string_value: typing.Callable[[str], T_Result],
        char_value: typing.Callable[[str], T_Result],
        map_value: typing.Callable[[MapValue], T_Result],
        list_value: typing.Callable[[typing.List[VariableValue]], T_Result],
        binary_tree_value: typing.Callable[[BinaryTreeValue], T_Result],
        singly_linked_list_value: typing.Callable[[SinglyLinkedListValue], T_Result],
        doubly_linked_list_value: typing.Callable[[DoublyLinkedListValue], T_Result],
        null_value: typing.Callable[[], T_Result],
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
        if self.__root__.type == "binaryTreeValue":
            return binary_tree_value(self.__root__)
        if self.__root__.type == "singlyLinkedListValue":
            return singly_linked_list_value(self.__root__)
        if self.__root__.type == "doublyLinkedListValue":
            return doubly_linked_list_value(self.__root__)
        if self.__root__.type == "nullValue":
            return null_value()

    __root__: typing_extensions.Annotated[
        typing.Union[
            _VariableValue.IntegerValue,
            _VariableValue.BooleanValue,
            _VariableValue.DoubleValue,
            _VariableValue.StringValue,
            _VariableValue.CharValue,
            _VariableValue.MapValue,
            _VariableValue.ListValue,
            _VariableValue.BinaryTreeValue,
            _VariableValue.SinglyLinkedListValue,
            _VariableValue.DoublyLinkedListValue,
            _VariableValue.NullValue,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


from .map_value import MapValue  # noqa: E402


class _VariableValue:
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

    class MapValue(MapValue):
        type: typing_extensions.Literal["mapValue"]

    class ListValue(pydantic.BaseModel):
        type: typing_extensions.Literal["listValue"]
        list_value: typing.List[VariableValue] = pydantic.Field(alias="listValue")

        class Config:
            allow_population_by_field_name = True

    class BinaryTreeValue(BinaryTreeValue):
        type: typing_extensions.Literal["binaryTreeValue"]

    class SinglyLinkedListValue(SinglyLinkedListValue):
        type: typing_extensions.Literal["singlyLinkedListValue"]

    class DoublyLinkedListValue(DoublyLinkedListValue):
        type: typing_extensions.Literal["doublyLinkedListValue"]

    class NullValue(pydantic.BaseModel):
        type: typing_extensions.Literal["nullValue"]


VariableValue.update_forward_refs()
