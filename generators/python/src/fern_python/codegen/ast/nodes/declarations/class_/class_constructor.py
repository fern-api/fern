from typing import Optional, Sequence

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...code_writer import CodeWriter
from ...type_hint import TypeHint
from ..function import FunctionDeclaration, FunctionParameter, FunctionSignature


class ClassConstructor(AstNode):
    def __init__(
        self,
        *,
        signature: FunctionSignature,
        body: CodeWriter,
        overloads: Optional[Sequence[FunctionSignature]] = None,
    ):
        new_signature = FunctionSignature(
            parameters=[FunctionParameter(name="self")] + list(signature.parameters),
            include_args=signature.include_args,
            named_parameters=signature.named_parameters,
            include_kwargs=signature.include_kwargs,
            return_type=None if signature.has_arguments() else TypeHint.none(),
        )
        # Convert overload signatures to include 'self' parameter
        new_overloads = None
        if overloads is not None:
            new_overloads = [
                FunctionSignature(
                    parameters=[FunctionParameter(name="self")] + list(overload.parameters),
                    include_args=overload.include_args,
                    named_parameters=overload.named_parameters,
                    include_kwargs=overload.include_kwargs,
                    return_type=None,
                )
                for overload in overloads
            ]
        self.function_declaration = FunctionDeclaration(
            name="__init__",
            signature=new_signature,
            body=body,
            overloads=new_overloads,
        )

    def get_metadata(self) -> AstNodeMetadata:
        return self.function_declaration.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write_node(self.function_declaration)
