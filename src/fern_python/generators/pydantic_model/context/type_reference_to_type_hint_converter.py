from typing import Callable, Optional

from fern_python.codegen import AST
from fern_python.generated import ir_types

from .type_name_to_class_reference_converter import TypeNameToClassReferenceConverter


class TypeReferenceToTypeHintConverter:
    def __init__(self, api_name: str, type_name_to_class_reference_converter: TypeNameToClassReferenceConverter):
        self._api_name = api_name
        self._type_name_to_class_reference_converter = type_name_to_class_reference_converter

    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return type_reference.visit(
            container=lambda container: self._get_type_hint_for_container(
                container=container,
                must_import_after_current_declaration=must_import_after_current_declaration,
            ),
            named=lambda type_name: self._get_type_hint_for_named(
                type_name=type_name,
                must_import_after_current_declaration=must_import_after_current_declaration,
            ),
            primitive=self._get_type_hint_for_primitive,
            unknown=AST.TypeHint.any,
            void=AST.TypeHint.none,
        )

    def _get_type_hint_for_container(
        self,
        container: ir_types.ContainerType,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return container.visit(
            list=lambda wrapped_type: AST.TypeHint.list(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                )
            ),
            map=lambda map_type: AST.TypeHint.dict(
                key_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.key_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                ),
                value_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.value_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                ),
            ),
            # Fern sets become Pydanic lists, since Pydantic models aren't hashable
            set=lambda wrapped_type: AST.TypeHint.list(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                )
            ),
            optional=lambda wrapped_type: AST.TypeHint.optional(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                )
            ),
        )

    def _get_type_hint_for_named(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return AST.TypeHint(
            type=self._type_name_to_class_reference_converter.get_class_reference_for_type_name(
                type_name=type_name,
                must_import_after_current_declaration=must_import_after_current_declaration,
            )
        )

    def _get_type_hint_for_primitive(self, primitive: ir_types.PrimitiveType) -> AST.TypeHint:
        to_return = primitive.visit(
            integer=AST.TypeHint.int_,
            double=AST.TypeHint.float_,
            string=AST.TypeHint.str_,
            boolean=AST.TypeHint.bool_,
            long=AST.TypeHint.int_,
            date_time=AST.TypeHint.str_,
            uuid=AST.TypeHint.str_,
        )
        return to_return
