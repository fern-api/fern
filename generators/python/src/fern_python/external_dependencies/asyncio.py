from fern_python.codegen import AST

ASYNCIO_MODULE = AST.Module.built_in(("asyncio",))


class Asyncio:
    @staticmethod
    def run(func: AST.Expression) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                import_=AST.ReferenceImport(module=AST.Module.built_in(("asyncio",))),
                qualified_name_excluding_import=("run",),
            ),
            args=[func],
        )
