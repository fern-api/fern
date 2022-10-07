from typing import Callable, Optional, Set

from fern_python.codegen import AST, Filepath, SourceFile
from fern_python.declaration_handler import (
    DeclarationHandlerContext,
    HashableDeclaredTypeName,
)
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generated import ir_types

from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter


class DeclarationHandlerContextImpl(DeclarationHandlerContext):
    def __init__(
        self,
        source_file: SourceFile,
        intermediate_representation: ir_types.IntermediateRepresentation,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
    ):
        super().__init__(source_file=source_file)

        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            type_declaration_referencer=type_declaration_referencer,
        )

        self._type_name_to_declaration = {
            HashableDeclaredTypeName.of(declaration.name): declaration
            for declaration in intermediate_representation.types
        }

        self._type_declaration_referencer = type_declaration_referencer

    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.TypeHint:
        return self._type_reference_to_type_hint_converter.get_type_hint_for_type_reference(
            type_reference,
            must_import_after_current_declaration=must_import_after_current_declaration,
        )

    def get_class_reference_for_type_name(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.ClassReference:
        return self._type_declaration_referencer.get_class_reference(
            name=type_name,
            must_import_after_current_declaration=must_import_after_current_declaration,
        )

    def get_referenced_types(self, type_name: ir_types.DeclaredTypeName) -> Set[HashableDeclaredTypeName]:
        declaration = self.get_declaration_for_type_name(type_name)
        return set(map(HashableDeclaredTypeName.of, declaration.referenced_types))

    def get_declaration_for_type_name(
        self,
        type_name: ir_types.DeclaredTypeName,
    ) -> ir_types.TypeDeclaration:
        return self._type_name_to_declaration[HashableDeclaredTypeName.of(type_name)]

    def get_class_name_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> str:
        return self._type_declaration_referencer.get_class_name(name=type_name)

    def get_filepath_for_type(self, type_name: ir_types.DeclaredTypeName) -> Filepath:
        return self._type_declaration_referencer.get_filepath(name=type_name)
