from typing import Optional, Sequence

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Module, Reference, ReferenceImport
from ...code_writer import CodeWriter
from .function_signature import FunctionSignature

OVERLOAD_DECORATOR = Reference(
    qualified_name_excluding_import=("overload",),
    import_=ReferenceImport(
        module=Module.built_in(("typing",)),
    ),
)


class FunctionDeclaration(AstNode):
    def __init__(
        self,
        *,
        name: str,
        signature: FunctionSignature,
        body: CodeWriter,
        overloads: Optional[Sequence[FunctionSignature]] = None,
        decorators: Optional[Sequence[AstNode]] = None,
        docstring: Optional[CodeWriter] = None,
        is_async: Optional[bool] = False,
    ):
        self.name = name
        self.signature = signature
        self.overloads = overloads or []
        self.body = body
        self.decorators = decorators or []
        self.docstring = docstring
        self.is_async = is_async

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        if len(self.overloads) > 0:
            metadata.references.add(OVERLOAD_DECORATOR)
        metadata.update(self.signature.get_metadata())
        for overload in self.overloads:
            metadata.update(overload.get_metadata())
        metadata.update(self.body.get_metadata())
        for decorator in self.decorators:
            metadata.update(decorator.get_metadata())
        if self.docstring is not None:
            metadata.update(self.docstring.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        for overload in self.overloads:
            self._write(writer, signature=overload, body=None)
        self._write(writer, signature=self.signature, body=self.body)

    def _write(self, writer: NodeWriter, signature: FunctionSignature, body: Optional[CodeWriter]) -> None:
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

        if self.is_async:
            writer.write("async ")
        writer.write(f"def {self.name}")
        writer.write_node(signature)
        with writer.indent():
            if self.docstring is not None:
                writer.write_line('"""')
                writer.write_node(self.docstring)
                writer.write_newline_if_last_line_not()
                writer.write_line('"""')

            if body is None:
                writer.write("...")
            else:
                body.write(writer=writer)
        writer.write_newline_if_last_line_not()
