from typing import Callable, Optional, Set

from fern_python.codegen import AST, SourceFile
from fern_python.declaration_handler import (
    DeclarationHandlerContext,
    HashableDeclaredTypeName,
)
from fern_python.generated import ir_types

from .type_name_to_class_reference_converter import TypeNameToClassReferenceConverter
from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter


class DeclarationHandlerContextImpl(DeclarationHandlerContext):
    def __init__(
        self,
        source_file: SourceFile,
        intermediate_representation: ir_types.IntermediateRepresentation,
    ):
        super().__init__(source_file=source_file)

        type_name_to_class_reference_converter = TypeNameToClassReferenceConverter(
            api_name=intermediate_representation.api_name
        )
        self._type_name_to_class_reference_converter = type_name_to_class_reference_converter

        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            api_name=intermediate_representation.api_name,
            type_name_to_class_reference_converter=type_name_to_class_reference_converter,
        )

        self._type_name_to_declaration = {
            HashableDeclaredTypeName.of(declaration.name): declaration
            for declaration in intermediate_representation.types
        }

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
        return self._type_name_to_class_reference_converter.get_class_reference_for_type_name(type_name)

    def get_referenced_types(self, type_name: ir_types.DeclaredTypeName) -> Set[HashableDeclaredTypeName]:
        declaration = self.get_declaration_for_type_name(type_name)
        return set(map(HashableDeclaredTypeName.of, declaration.referenced_types))

    def get_declaration_for_type_name(
        self,
        type_name: ir_types.DeclaredTypeName,
    ) -> ir_types.TypeDeclaration:
        return self._type_name_to_declaration[HashableDeclaredTypeName.of(type_name)]

    def get_class_name_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> str:
        return self._type_name_to_class_reference_converter.get_class_name_for_type_name(type_name)
