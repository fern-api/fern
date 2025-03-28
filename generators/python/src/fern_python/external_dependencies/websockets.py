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

WEBSOCKETS_SYNC_CLIENT_MODULE = AST.Module.external(
    module_path=("websockets", "sync", "client"),
    dependency=AST.Dependency(
        name="websockets",
        version="12.0",
        compatibility=DependencyCompatibility.EXACT,
    ),
)

WEBSOCKETS_SYNC_CONNECTION_MODULE = AST.Module.external(
    module_path=("websockets", "sync", "connection"),
    dependency=AST.Dependency(
        name="websockets",
        version="12.0",
        compatibility=DependencyCompatibility.EXACT,
    ),
)

WEBSOCKETS_SYNC_EXCEPTION_MODULE = AST.Module.external(
    module_path=("websockets", "sync", "exceptions"),
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
    def get_async_websocket_client_protocol() -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=("WebSocketClientProtocol",),
            import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE),
        )

    @staticmethod
    def get_sync_websocket_client_protocol() -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=("Connection",),
            import_=AST.ReferenceImport(module=WEBSOCKETS_SYNC_CONNECTION_MODULE, alias="websockets_sync_connection"),
        )

    @staticmethod
    def get_websocket_exception() -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=("WebSocketException",),
            import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE),
        )

    @staticmethod
    def async_connect(url: str, headers: str) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write("async with ")
            writer.write_reference(
                AST.Reference(
                    import_=AST.ReferenceImport(module=WEBSOCKETS_MODULE),
                    qualified_name_excluding_import=("connect",),
                )
            )
            writer.write(f"({url}, extra_headers={headers}) as protocol:")

        return AST.Expression(AST.CodeWriter(write))

    @staticmethod
    def sync_connect(url: str, headers: str) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write("with ")
            writer.write_reference(
                AST.Reference(
                    import_=AST.ReferenceImport(module=WEBSOCKETS_SYNC_CLIENT_MODULE, alias="websockets_sync_client"),
                    qualified_name_excluding_import=("connect",),
                )
            )
            writer.write(f"({url}, additional_headers={headers}) as protocol:")

        return AST.Expression(AST.CodeWriter(write))
