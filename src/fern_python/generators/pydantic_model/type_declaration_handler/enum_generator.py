import ir as ir_types

from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext

from ..custom_config import CustomConfig
from .abstract_type_generator import AbstractTypeGenerator
from .get_visit_method import VisitableItem, get_visit_method


class EnumGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        enum: ir_types.EnumTypeDeclaration,
        context: DeclarationHandlerContext,
        custom_config: CustomConfig,
    ):
        super().__init__(name=name, context=context, custom_config=custom_config)
        self._enum = enum

    def generate(self) -> None:
        enum_class = AST.ClassDeclaration(
            name=self._name.name,
            extends=[
                AST.ClassReference(
                    qualified_name_excluding_import=("str",),
                ),
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in("enum")),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
        )

        self._context.source_file.add_class_declaration(enum_class)

        for value in self._enum.values:
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=value.name.screaming_snake_case,
                    initializer=AST.Expression(f'"{value.value}"'),
                )
            )

        enum_class.add_method(
            get_visit_method(
                items=[
                    VisitableItem(
                        parameter_name=self._get_parameter_name_for_enum_value(value),
                        expected_value=value.value,
                        visitor_argument=None,
                    )
                    for value in self._enum.values
                ],
                reference_to_current_value="self.value",
                are_checks_exhaustive=False,
            )
        )

    def _get_parameter_name_for_enum_value(self, enum_value: ir_types.EnumValue) -> str:
        return enum_value.name.snake_case
