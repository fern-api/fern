from typing import Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter
from ....references import Reference
from ...code_writer import CodeWriter
from ...type_hint import TypeHint
from ..function import FunctionDeclaration, FunctionParameter, FunctionSignature


class ClassConstructor(AstNode):
    def __init__(
        self,
        *,
        signature: FunctionSignature,
        body: CodeWriter,
    ):
        new_signature = FunctionSignature(
            parameters=[FunctionParameter(name="self")] + list(signature.parameters),
            include_args=signature.include_args,
            named_parameters=signature.named_parameters,
            include_kwargs=signature.include_kwargs,
            return_type=None if signature.has_arguments() else TypeHint.none(),
        )
        self.function_declaration = FunctionDeclaration(
            name="__init__",
            signature=new_signature,
            body=body,
        )

    def get_references(self) -> Set[Reference]:
        return self.function_declaration.get_references()

    def get_generics(self) -> Set[GenericTypeVar]:
        return self.function_declaration.get_generics()

    def write(self, writer: NodeWriter) -> None:
        writer.write_node(self.function_declaration)
