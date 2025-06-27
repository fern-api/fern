T_Result = typing.TypeVar("T_Result")

class KeyType(str, enum.Enum):
    NAME = "name"
    VALUE = "value"
    
    def visit(self, name: typing.Callable[[], T_Result], value: typing.Callable[[], T_Result]) -> T_Result:
        if self is KeyType.NAME:
            return name()
        if self is KeyType.VALUE:
            return value()

