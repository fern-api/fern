from fern_python.codegen import AST, SourceFile
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter


class DeclarationHandlerContextImpl(DeclarationHandlerContext):
    def __init__(self, source_file: SourceFile, intermediate_representation: ir_types.IntermediateRepresentation):
        super().__init__(source_file=source_file)
        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            api_name=intermediate_representation.api_name
        )

    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        return self._type_reference_to_type_hint_converter.get_type_hint_for_type_reference(type_reference)
