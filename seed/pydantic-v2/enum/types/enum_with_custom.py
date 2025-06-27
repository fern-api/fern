T_Result = typing.TypeVar("T_Result")

class EnumWithCustom(str, enum.Enum):
    SAFE = "safe"
    CUSTOM = "Custom"
    
    def visit(self, safe: typing.Callable[[], T_Result], custom: typing.Callable[[], T_Result]) -> T_Result:
        if self is EnumWithCustom.SAFE:
            return safe()
        if self is EnumWithCustom.CUSTOM:
            return custom()

