from fern_python.codegen import AST

BACKPORTS_MODULE = AST.Module.external(
    module_path=("backports.cached_property",),
    dependency=AST.Dependency(name="backports.cached_property", version="1.0.2"),
    types_package=AST.Dependency(name="types-backports", version="0.1.3"),
)


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=BACKPORTS_MODULE)
    )


class Backports:
    @staticmethod
    def cached_property() -> AST.Expression:
        return AST.Expression(
            AST.Reference(
                import_=AST.ReferenceImport(
                    module=BACKPORTS_MODULE,
                    named_import="cached_property",
                ),
                qualified_name_excluding_import=(),
            )
        )
