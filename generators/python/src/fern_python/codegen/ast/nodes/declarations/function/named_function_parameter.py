from typing import Optional

import fern.ir.resources as ir_types
from ...expressions import Expression
from ...type_hint import TypeHint
from .function_parameter import FunctionParameter


class NamedFunctionParameter(FunctionParameter):
    def __init__(
        self,
        *,
        name: str,
        docs: Optional[str] = None,
        type_hint: Optional[TypeHint] = None,
        initializer: Optional[Expression] = None,
        raw_type: Optional[ir_types.TypeReference] = None,
        raw_name: Optional[str] = None,
    ):
        super().__init__(
            name=name,
            docs=docs,
            type_hint=type_hint,
            initializer=(
                Expression(TypeHint.none())
                if initializer is None and type_hint is not None and type_hint.is_optional
                else initializer
            ),
        )

        self.raw_name = raw_name
        self.raw_type = raw_type
