T_Result = typing.TypeVar("T_Result")

class Status(str, enum.Enum):
    KNOWN = "Known"
    UNKNOWN = "Unknown"
    
    def visit(self, known: typing.Callable[[], T_Result], unknown: typing.Callable[[], T_Result]) -> T_Result:
        if self is Status.KNOWN:
            return known()
        if self is Status.UNKNOWN:
            return unknown()

