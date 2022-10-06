from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Sequence

from fern_python.codegen import AST

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


@dataclass
class VisitableItem:
    parameter_name: str
    expected_value: str
    visitor_argument: Optional[VisitorArgument]


@dataclass
class VisitorArgument:
    expression: AST.Expression
    type: AST.TypeHint


def get_visit_method(
    items: Sequence[VisitableItem],
    reference_to_current_value: str,
    are_checks_exhaustive: bool,
) -> AST.FunctionDeclaration:
    def writevisitor_body(
        writer: AST.NodeWriter,
        reference_resolver: AST.ReferenceResolver,
    ) -> None:
        for item in items:
            writer.write_line(f'if {reference_to_current_value} == "{item.expected_value}":')
            with writer.indent():
                writer.write_line(f"return {item.parameter_name}(")
                if item.visitor_argument is not None:
                    writer.write_node(item.visitor_argument.expression)
                writer.write(")\n")
        if not are_checks_exhaustive:
            writer.write_line()
            writer.write_line("# the above checks are exhaustive, but this is necessary to satisfy the type checker")
            writer.write_line("raise RuntimeError()")

    return AST.FunctionDeclaration(
        name="visit",
        signature=AST.FunctionSignature(
            parameters=[
                AST.FunctionParameter(
                    name=item.parameter_name,
                    type_hint=AST.TypeHint.callable(
                        parameters=[item.visitor_argument.type] if item.visitor_argument is not None else [],
                        return_type=AST.TypeHint(type=VISITOR_RETURN_TYPE),
                    ),
                )
                for item in items
            ],
            return_type=AST.TypeHint.generic(VISITOR_RETURN_TYPE),
        ),
        body=AST.CodeWriter(writevisitor_body),
    )
