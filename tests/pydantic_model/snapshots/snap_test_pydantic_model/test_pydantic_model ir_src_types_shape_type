import enum
import typing

T_Result = typing.TypeVar("T_Result")


class ShapeType(str, enum.Enum):
    ENUM = "ENUM"
    OBJECT = "OBJECT"
    UNION = "UNION"

    def visit(
        self,
        enum: typing.Callable[[], T_Result],
        object: typing.Callable[[], T_Result],
        union: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.value == "ENUM":
            return enum()
        if self.value == "OBJECT":
            return object()
        if self.value == "UNION":
            return union()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
