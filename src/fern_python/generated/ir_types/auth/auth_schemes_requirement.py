import enum
import typing

T_Result = typing.TypeVar("T_Result")


class AuthSchemesRequirement(str, enum.Enum):
    ALL = "ALL"
    ANY = "ANY"

    def visit(self, all: typing.Callable[[], T_Result], any: typing.Callable[[], T_Result]) -> T_Result:
        if self.value == "ALL":
            return all()
        if self.value == "ANY":
            return any()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
