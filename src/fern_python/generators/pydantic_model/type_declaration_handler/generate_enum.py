from fern_python.codegen import AST, SourceFile
from fern_python.generated import ir_types

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


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
                initializer=AST.CodeWriter(f'"{value.value}"'),
            )
        )

    def write_enum_body(
        writer: AST.NodeWriter,
        reference_resolver: AST.ReferenceResolver,
    ) -> None:
        for value in enum.values:
            writer.write_line(f'if self.value == "{value.value}":')
            with writer.indent():
                writer.write_line(f"return {get_parameter_name_for_enum_value(value)}()")
        writer.write_line()
        writer.write_line("# the above checks are exhaustive, but this is necessary to satisfy the type checker")
        writer.write_line("raise RuntimeError()")

    enum_class.add_method(
        AST.FunctionDeclaration(
            name="_visit",
            parameters=[
                AST.FunctionParameter(
                    name=get_parameter_name_for_enum_value(value),
                    type_hint=AST.TypeHint.callable(
                        parameters=[],
                        return_type=AST.TypeHint(type=VISITOR_RETURN_TYPE),
                    ),
                )
                for value in enum.values
            ],
            return_type=AST.TypeHint.generic(VISITOR_RETURN_TYPE),
            body=AST.CodeWriter(write_enum_body),
        )
    )


def get_parameter_name_for_enum_value(enum_value: ir_types.EnumValue) -> str:
    return enum_value.name.camel_case
