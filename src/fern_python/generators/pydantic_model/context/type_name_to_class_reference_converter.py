from typing import Callable, Optional

from fern_python.codegen import AST
from fern_python.generated import ir_types

from ..filepaths import get_filepath_for_type


class TypeNameToClassReferenceConverter:
    def __init__(self, api_name: str):
        self._api_name = api_name

    def get_class_reference_for_type_name(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.ClassReference:
        filepath = get_filepath_for_type(
            type_name=type_name,
            api_name=self._api_name,
        )
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=filepath.to_module(),
                named_import=self.get_class_name_for_type_name(type_name),
            ),
            qualified_name_excluding_import=(),
            must_import_after_current_declaration=must_import_after_current_declaration(type_name)
            if must_import_after_current_declaration is not None
            else False,
        )

    def get_class_name_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> str:
        return type_name.name
