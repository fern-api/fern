from typing import Optional

from ...expressions import Expression
from ...type_hint import TypeHint
from .function_parameter import FunctionParameter


class NamedFunctionParameter(FunctionParameter):
    def __init__(
        self,
        *,
        name: str,
        type_hint: Optional[TypeHint] = None,
        initializer: Optional[Expression] = None,
    ):
        super().__init__(
            name=name,
            type_hint=type_hint,
            initializer=(
                Expression(TypeHint.none())
                if initializer is None and type_hint is not None and TypeHint.is_optional(type_hint)
                else initializer
            ),
        )
