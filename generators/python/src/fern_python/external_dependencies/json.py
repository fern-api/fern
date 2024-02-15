from fern_python.codegen import AST

JSON_MODULE = AST.Module.built_in(("json",))


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=JSON_MODULE))


class Json:
    @staticmethod
    def JSONDecodeError() -> AST.ClassReference:
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=AST.Module.built_in(("json", "decoder")), named_import="JSONDecodeError"
            ),
            qualified_name_excluding_import=(),
        )

    @staticmethod
    def loads(obj: AST.Expression) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                import_=AST.ReferenceImport(module=AST.Module.built_in(("json",))),
                qualified_name_excluding_import=("loads",),
            ),
            args=[obj],
        )
