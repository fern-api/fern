T_Result = typing.TypeVar("T_Result")

class Color(str, enum.Enum):
    RED = "red"
    BLUE = "blue"
    
    def visit(self, red: typing.Callable[[], T_Result], blue: typing.Callable[[], T_Result]) -> T_Result:
        if self is Color.RED:
            return red()
        if self is Color.BLUE:
            return blue()

