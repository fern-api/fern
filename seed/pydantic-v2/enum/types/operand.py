T_Result = typing.TypeVar("T_Result")

class Operand(str, enum.Enum):
    """Tests enum name and value can be
    different."""
    GREATER_THAN = ">"
    EQUAL_TO = "="
    LESS_THAN = "less_than"
    """
    The name and value should be similar
    are similar for less than.
    """
    
    def visit(
        self,
        greater_than: typing.Callable[[], T_Result],
        equal_to: typing.Callable[[], T_Result],
        less_than: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self is Operand.GREATER_THAN:
            return greater_than()
        if self is Operand.EQUAL_TO:
            return equal_to()
        if self is Operand.LESS_THAN:
            return less_than()

