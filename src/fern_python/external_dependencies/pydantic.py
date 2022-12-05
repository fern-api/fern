from fern_python.codegen import AST


def _export(*export: str) -> AST.ClassReference:
    return AST.ClassReference(
        import_=AST.ReferenceImport(
            module=AST.Module.external(
                dependency=AST.Dependency(name="pydantic", version="^1.9.2"),
                module_path=("pydantic",),
            )
        ),
        qualified_name_excluding_import=export,
    )


class Pydantic:

    Field = _export("Field")

    BaseModel = _export("BaseModel")

    PrivateAttr = _export("PrivateAttr")

    class Extra:
        forbid = AST.Expression(_export("Extra", "forbid"))

    root_validator = AST.ReferenceNode(_export("root_validator"))

    @staticmethod
    def validator(field_name: str) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=_export("validator"),
            args=[AST.Expression(expression=f'"{field_name}"')],
        )
