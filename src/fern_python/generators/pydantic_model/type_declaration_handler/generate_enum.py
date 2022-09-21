from fern_python.codegen import AST, SourceFile
from fern_python.generated import ir_types

from .get_visit_method import VisitableItem, get_visit_method


def generate_enum(name: ir_types.DeclaredTypeName, enum: ir_types.EnumTypeDeclaration, source_file: SourceFile) -> None:
    enum_class = AST.ClassDeclaration(
        name=name.name,
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

    source_file.add_class_declaration(enum_class)

    for value in enum.values:
        enum_class.add_attribute(
            AST.VariableDeclaration(
                name=value.name.screaming_snake_case,
                initializer=AST.Expression(f'"{value.value}"'),
            )
        )

    enum_class.add_method(
        get_visit_method(
            items=[
                VisitableItem(
                    parameter_name=get_parameter_name_for_enum_value(value),
                    expected_value=value.value,
                    visitor_argument=None,
                )
                for value in enum.values
            ],
            reference_to_current_value="self.value",
            are_checks_exhaustive=False,
        )
    )


def get_parameter_name_for_enum_value(enum_value: ir_types.EnumValue) -> str:
    return enum_value.name.snake_case
