from fern_python.codegen import AST

FUNCTOOLS_MODULE = AST.Module.built_in(("functools",))


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=FUNCTOOLS_MODULE)
    )


class Functools:
    @staticmethod
    def cached_property() -> AST.Expression:
        return AST.Expression(
            AST.Reference(
                import_=AST.ReferenceImport(module=FUNCTOOLS_MODULE),
                qualified_name_excluding_import=("cached_property",),
            )
        )
