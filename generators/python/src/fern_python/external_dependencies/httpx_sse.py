from fern_python.codegen import AST
from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility

HTTPX_SSE = AST.Module.external(
    module_path=("httpx_sse",),
    dependency=AST.Dependency(
        name="httpx-sse",
        version="0.4.0",
        compatibility=DependencyCompatibility.EXACT,
    ),
)


class HttpxSSE:
    EVENT_SOURCE = AST.ClassReference(
        qualified_name_excluding_import=("EventSource",),
        import_=AST.ReferenceImport(module=HTTPX_SSE),
    )
