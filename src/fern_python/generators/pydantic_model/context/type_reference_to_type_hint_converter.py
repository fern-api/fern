from fern_python.codegen import AST
from fern_python.generated import ir_types

from ..filepaths import get_filepath_for_type


class TypeReferenceToTypeHintConverter:
    def __init__(self, api_name: str):
        self._api_name = api_name

    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        return type_reference._visit(
            container=self._get_type_hint_for_container,
            named=self._get_type_hint_for_named,
            primitive=self._get_type_hint_for_primitive,
            unknown=AST.TypeHint.any,
            void=AST.TypeHint.none,
        )

    def _get_type_hint_for_container(self, container: ir_types.ContainerType) -> AST.TypeHint:
        return container._visit(
            list=lambda wrapped_type: AST.TypeHint.list(self.get_type_hint_for_type_reference(wrapped_type)),
            map=lambda map_type: AST.TypeHint.dict(
                key_type=self.get_type_hint_for_type_reference(map_type.key_type),
                value_type=self.get_type_hint_for_type_reference(map_type.value_type),
            ),
            set=lambda wrapped_type: AST.TypeHint.set(self.get_type_hint_for_type_reference(wrapped_type)),
            optional=lambda wrapped_type: AST.TypeHint.optional(self.get_type_hint_for_type_reference(wrapped_type)),
        )

    def _get_type_hint_for_named(self, type_name: ir_types.DeclaredTypeName) -> AST.TypeHint:
        filepath = get_filepath_for_type(
            type_name=type_name,
            api_name=self._api_name,
        )
        reference = AST.ClassReference(
            import_=AST.ReferenceImport(
                module=filepath.to_module(),
                named_import=type_name.name,
            ),
            qualified_name_excluding_import=(),
        )
        return AST.TypeHint(type=reference)

    def _get_type_hint_for_primitive(self, primitive: ir_types.PrimitiveType) -> AST.TypeHint:
        return primitive._visit(
            integer=AST.TypeHint.int,
            double=AST.TypeHint.float,
            string=AST.TypeHint.str,
            boolean=AST.TypeHint.bool,
            long=AST.TypeHint.int,
            date_time=AST.TypeHint.str,
            uuid=AST.TypeHint.str,
        )
