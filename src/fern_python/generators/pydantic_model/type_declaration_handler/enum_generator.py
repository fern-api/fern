from typing import Optional

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator
from .get_visit_method import VisitableItem, get_visit_method


class EnumGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        enum: ir_types.EnumTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
    ):
        super().__init__(name=name, context=context, custom_config=custom_config, source_file=source_file, docs=docs)
        self._enum = enum

    def generate(self) -> None:
        enum_class = AST.ClassDeclaration(
            name=self._get_class_name(),
            extends=[
                AST.ClassReference(
                    qualified_name_excluding_import=("str",),
                ),
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in("enum")),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
            docstring=AST.Docstring(self._docs) if self._docs is not None else None,
        )

        self._source_file.add_class_declaration(enum_class)

        for value in self._enum.values:
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=self._get_class_var_name(value),
                    initializer=AST.Expression(f'"{value.name.wire_value}"'),
                    docstring=AST.Docstring(value.docs) if value.docs is not None else None,
                )
            )

        enum_class.add_method(
            get_visit_method(
                items=[
                    VisitableItem(
                        parameter_name=self._get_visitor_parameter_name_for_enum_value(value),
                        expected_value=f"{self._get_class_name()}.{self._get_class_var_name(value)}",
                        visitor_argument=None,
                    )
                    for value in self._enum.values
                ],
                reference_to_current_value="self",
                should_use_is_for_equality_check=True,
            )
        )

    def _get_class_var_name(self, enum_value: ir_types.EnumValue) -> str:
        return enum_value.name.name.screaming_snake_case.unsafe_name

    def _get_visitor_parameter_name_for_enum_value(self, enum_value: ir_types.EnumValue) -> str:
        return enum_value.name.name.snake_case.safe_name

    def _get_class_name(self) -> str:
        return self._name.name.original_name
