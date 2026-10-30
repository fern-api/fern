from typing import Optional, Set

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference
from ...type_hint import TypeHint
from ...type_hint.type_hint import get_reference_to_typing_extensions_import

_TYPE_ALIAS_TYPE = get_reference_to_typing_extensions_import("TypeAliasType")


class TypeAliasDeclaration(AstNode):
    def __init__(
        self,
        name: str,
        type_hint: TypeHint,
        snippet: Optional[str] = None,
        docs: Optional[str] = None,
        # Write `Name = TypeAliasType("Name", ...)`: a recursive alias needs a name Pydantic v2
        # can resolve lazily, or validating it expands the alias forever. Type checkers get the
        # plain alias instead, as mypy can't resolve a TypeAliasType that names itself.
        is_type_alias_type: bool = False,
    ):
        self.name = name
        self.type_hint = type_hint
        self.snippet = snippet
        self.docs = docs
        self.is_type_alias_type = is_type_alias_type
        self.ghost_references: Set[Reference] = set()

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        metadata.update(self.type_hint.get_metadata())
        metadata.references.update(self.ghost_references)
        if self.is_type_alias_type:
            metadata.references.add(_TYPE_ALIAS_TYPE)
            metadata.references.add(TypeHint.type_checking_reference())
        return metadata

    def add_ghost_reference(self, reference: Reference) -> None:
        self.ghost_references.add(reference)

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.snippet is not None:
            writer.write_line('"""')
            writer.write(self.snippet)
            writer.write_newline_if_last_line_not()
            writer.write_line('"""')

        if self.is_type_alias_type:
            writer.write("if ")
            writer.write_reference(TypeHint.type_checking_reference())
            writer.write_line(":")
            with writer.indent():
                self._write_assignment(writer)
            writer.write_line("else:")
            with writer.indent():
                writer.write(f"{self.name} = ")
                writer.write_reference(_TYPE_ALIAS_TYPE)
                writer.write(f'("{self.name}", ')
                self.type_hint.write(writer=writer)
                writer.write(")")
                writer.write_newline_if_last_line_not()
        else:
            self._write_assignment(writer)

        if self.docs is not None:
            writer.write_line('"""')
            writer.write(self.docs)
            writer.write_newline_if_last_line_not()
            writer.write_line('"""')

    def _write_assignment(self, writer: NodeWriter) -> None:
        writer.write(f"{self.name} = ")
        self.type_hint.write(writer=writer)
        writer.write_newline_if_last_line_not()
