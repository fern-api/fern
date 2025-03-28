from fern_python.codegen import AST

CONTEXTLIB_MODULE = AST.Module.built_in(("contextlib",))


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=CONTEXTLIB_MODULE)
    )


class Contextlib:
    @staticmethod
    def contextmanager() -> AST.ClassReference:
        return AST.ClassReference(
            import_=AST.ReferenceImport(module=AST.Module.built_in(("contextlib",)), named_import="contextmanager"),
            qualified_name_excluding_import=(),
        )

    @staticmethod
    def asynccontextmanager() -> AST.ClassReference:
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=AST.Module.built_in(("contextlib",)), named_import="asynccontextmanager"
            ),
            qualified_name_excluding_import=(),
        )
