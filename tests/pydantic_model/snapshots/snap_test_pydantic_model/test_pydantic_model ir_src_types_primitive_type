import enum
import typing

T_Result = typing.TypeVar("T_Result")


class PrimitiveType(str, enum.Enum):
    INTEGER = "INTEGER"
    DOUBLE = "DOUBLE"
    STRING = "STRING"
    BOOLEAN = "BOOLEAN"
    LONG = "LONG"
    DATE_TIME = "DATE_TIME"
    UUID = "UUID"

    def visit(
        self,
        integer: typing.Callable[[], T_Result],
        double: typing.Callable[[], T_Result],
        string: typing.Callable[[], T_Result],
        boolean: typing.Callable[[], T_Result],
        long: typing.Callable[[], T_Result],
        date_time: typing.Callable[[], T_Result],
        uuid: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.value == "INTEGER":
            return integer()
        if self.value == "DOUBLE":
            return double()
        if self.value == "STRING":
            return string()
        if self.value == "BOOLEAN":
            return boolean()
        if self.value == "LONG":
            return long()
        if self.value == "DATE_TIME":
            return date_time()
        if self.value == "UUID":
            return uuid()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
