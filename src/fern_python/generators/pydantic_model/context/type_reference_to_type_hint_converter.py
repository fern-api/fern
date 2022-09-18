from typing import Callable, Optional

from fern_python.codegen import AST
from fern_python.generated import ir_types

from ..filepaths import get_filepath_for_type


class TypeReferenceToTypeHintConverter:
    def __init__(self, api_name: str):
        self._api_name = api_name

    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return type_reference._visit(
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
        return container._visit(
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
        filepath = get_filepath_for_type(
            type_name=type_name,
            api_name=self._api_name,
        )
        reference = AST.ClassReference(
            import_=AST.ReferenceImport(
                module=filepath.to_module(),
                named_import=type_name.name,
                must_import_after_current_declaration=must_import_after_current_declaration(type_name)
                if must_import_after_current_declaration is not None
                else False,
            ),
            qualified_name_excluding_import=(),
        )
        return AST.TypeHint(type=reference)

    def _get_type_hint_for_primitive(self, primitive: ir_types.PrimitiveType) -> AST.TypeHint:
        return primitive._visit(
            integer=AST.TypeHint.int_,
            double=AST.TypeHint.float_,
            string=AST.TypeHint.str_,
            boolean=AST.TypeHint.bool_,
            long=AST.TypeHint.int_,
            date_time=AST.TypeHint.str_,
            uuid=AST.TypeHint.str_,
        )
