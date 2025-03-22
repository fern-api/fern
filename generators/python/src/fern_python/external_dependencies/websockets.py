from fern_python.codegen import AST
from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility

WEBSOCKETS_MODULE = AST.Module.external(
    module_path=("websockets",),
    dependency=AST.Dependency(
        name="websockets",
        version="12.0",
        compatibility=DependencyCompatibility.EXACT,
    ),
)


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE)
    )


class Websockets:
    @staticmethod
    def async_connect(url: str) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write("await ")
            writer.write_reference(
                AST.Reference(
                    import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE),
                    qualified_name_excluding_import=("connect",),
                )
            )
            writer.write("(")
            writer.write(url)
            writer.write(")\n")

        return AST.Expression(AST.CodeWriter(write))

    @staticmethod
    def sync_connect(url: str) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_reference(
                AST.Reference(
                    import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE),
                    qualified_name_excluding_import=("sync", "client", "connect"),
                )
            )
            writer.write("(")
            writer.write(url)
            writer.write(")\n")

        return AST.Expression(AST.CodeWriter(write))
