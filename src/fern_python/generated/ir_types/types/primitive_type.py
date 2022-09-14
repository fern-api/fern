import typing
from enum import Enum

_Result = typing.TypeVar("_Result")


class PrimitiveType(str, Enum):
    integer = "INTEGER"
    double = "DOUBLE"
    string = "STRING"
    boolean = "BOOLEAN"
    long = "LONG"
    date_time = "DATE_TIME"
    uuid = "UUID"

    def _visit(
        self,
        integer: typing.Callable[[], _Result],
        double: typing.Callable[[], _Result],
        string: typing.Callable[[], _Result],
        boolean: typing.Callable[[], _Result],
        long: typing.Callable[[], _Result],
        date_time: typing.Callable[[], _Result],
        uuid: typing.Callable[[], _Result],
    ) -> _Result:
        if self.value == "INTEGER":
            return integer()
        if self.value == "DOUBLE":
            return integer()
        if self.value == "STRING":
            return integer()
        if self.value == "BOOLEAN":
            return integer()
        if self.value == "LONG":
            return integer()
        if self.value == "DATE_TIME":
            return integer()
        if self.value == "UUID":
            return uuid()
        raise RuntimeError("Unknown primitive_type:", self.value)
