from typing import Callable, Optional, Set

import fern.ir.pydantic as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from .pydantic_generator_context import (
    HashableDeclaredTypeName,
    PydanticGeneratorContext,
)
from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter


class PydanticGeneratorContextImpl(PydanticGeneratorContext):
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
        generator_config: GeneratorConfig,
    ):
        super().__init__(ir=ir, generator_config=generator_config)
        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            type_declaration_referencer=type_declaration_referencer,
        )

        self._type_name_to_declaration = {
            HashableDeclaredTypeName.of(declaration.name): declaration for declaration in ir.types
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

    def does_circularly_reference_itself(self, type_name: ir_types.DeclaredTypeName) -> bool:
        return HashableDeclaredTypeName.of(type_name) in self.get_referenced_types(type_name)

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

    def get_filepath_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> Filepath:
        return self._type_declaration_referencer.get_filepath(name=type_name)
