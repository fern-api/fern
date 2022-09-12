from ..codegen import AST


def get_reference_to_pydantic_export(export: str) -> AST.ClassReference:
    return AST.ClassReference(
        module=("pydantic",),
        name_inside_import=(export,),
        from_module=AST.Dependency(name="pydantic", version="^1.9.2"),
    )


PYDANTIC_BASE_MODEL_REFERENCE = get_reference_to_pydantic_export("BaseModel")
PYDANTIC_FIELD_REFERENCE = get_reference_to_pydantic_export("Field")


class PydanticModel:
    _class_declaration: AST.ClassDeclaration
    _has_aliases: bool = False

    def __init__(self, name: str):
        self._class_declaration = AST.ClassDeclaration(
            name=name,
            extends=[PYDANTIC_BASE_MODEL_REFERENCE],
        )

    def add_field(self, name: str, type_hint: AST.TypeHint, json_field_name: str) -> None:
        initializer = (
            AST.CodeWriter(FieldNameInitializer(json_field_name=json_field_name)) if json_field_name != name else None
        )

        if initializer is not None:
            self._has_aliases = True

        self._class_declaration.add_attribute(
            AST.VariableDeclaration(name=name, type_hint=type_hint, initializer=initializer)
        )

    def add_root_type(self, root_type: AST.TypeHint) -> None:
        self._class_declaration.add_attribute(AST.VariableDeclaration(name="__root__", type_hint=root_type))

    def finish(self) -> AST.ClassDeclaration:
        if self._has_aliases:
            config = AST.ClassDeclaration(name="Config")
            config.add_attribute(
                AST.VariableDeclaration(
                    name="allow_population_by_field_name",
                    initializer=AST.CodeWriter("True"),
                )
            )
            self._class_declaration.add_class(declaration=config)

        return self._class_declaration


class FieldNameInitializer(AST.ReferencingCodeWriter):
    _json_field_name: str

    def __init__(self, json_field_name: str):
        super().__init__()
        self._json_field_name = json_field_name

    def write(self, reference_resolver: AST.ReferenceResolver) -> str:
        return f'{reference_resolver.resolve_reference(PYDANTIC_FIELD_REFERENCE)}(alias="{self._json_field_name}")'
