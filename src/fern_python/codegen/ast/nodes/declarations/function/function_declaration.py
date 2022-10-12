from typing import Optional, Sequence, Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter
from ....references import Module, Reference, ReferenceImport
from ...code_writer import CodeWriter
from .function_signature import FunctionSignature

OVERLOAD_DECORATOR = Reference(
    qualified_name_excluding_import=("overload",),
    import_=ReferenceImport(
        module=Module.built_in("typing"),
    ),
)


class FunctionDeclaration(AstNode):
    def __init__(
        self,
        *,
        name: str,
        signature: FunctionSignature,
        body: CodeWriter,
        overloads: Sequence[FunctionSignature] = None,
        decorators: Sequence[AstNode] = None,
    ):
        self.name = name
        self.signature = signature
        self.overloads = overloads or []
        self.body = body
        self.decorators = decorators or []

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if len(self.overloads) > 0:
            references.add(OVERLOAD_DECORATOR)
        references.update(self.signature.get_references())
        for overload in self.overloads:
            references.update(overload.get_references())
        references.update(self.body.get_references())
        for decorator in self.decorators:
            references.update(decorator.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        generics.update(self.signature.get_generics())
        for overload in self.overloads:
            generics.update(overload.get_generics())
        generics.update(self.body.get_generics())
        for decorator in self.decorators:
            generics.update(decorator.get_generics())
        return generics

    def write(self, writer: NodeWriter) -> None:
        for overload in self.overloads:
            self._write(writer, signature=overload, body=None)
        self._write(writer, signature=self.signature, body=self.body)

    def _write(
        self,
        writer: NodeWriter,
        signature: FunctionSignature,
        body: Optional[CodeWriter],
    ) -> None:
        if body is None:
            writer.write("@")
            writer.write_reference(OVERLOAD_DECORATOR)
            if len(self.overloads) <= 1:
                writer.write("  # type: ignore")
            writer.write_line()

        # apply decorators in reverse order, since they are executed by Python
        # from bottom to top
        for decorator in reversed(self.decorators):
            writer.write("@")
            writer.write_node(decorator)
            writer.write_line()

        writer.write(f"def {self.name}")
        writer.write_node(signature)
        with writer.indent():
            if body is None:
                writer.write("...")
            else:
                body.write(writer=writer)
        writer.write_newline_if_last_line_not()
