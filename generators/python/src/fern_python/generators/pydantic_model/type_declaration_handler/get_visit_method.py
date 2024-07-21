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
    *,
    items: Sequence[VisitableItem],
    reference_to_current_value: str,
    should_use_is_for_equality_check: bool = False,
    pre_tree_expressions: Optional[Sequence[AST.Expression]] = None,
) -> AST.FunctionDeclaration:
    def write_visitor_body(
        writer: AST.NodeWriter,
    ) -> None:
        if pre_tree_expressions is not None:
            for expression in pre_tree_expressions:
                writer.write_node(expression)
                writer.write_newline_if_last_line_not()

        for item in items:
            writer.write_line(
                f"if {reference_to_current_value}"
                + f' {"is" if should_use_is_for_equality_check else "=="} '
                + f"{item.expected_value}:"
            )
            with writer.indent():
                writer.write_line(f"return {item.parameter_name}(")
                if item.visitor_argument is not None:
                    writer.write_node(item.visitor_argument.expression)
                writer.write(")\n")

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
        body=AST.CodeWriter(write_visitor_body),
    )
