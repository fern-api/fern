from typing import Optional

from fern_python.codegen import AST
from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility

HTTPX_SSE = AST.Module.external(
    module_path=("httpx-sse",),
    dependency=AST.Dependency(
        name="httpx",
        version="0.4.*",
        compatibility=DependencyCompatibility.EXACT,
    ),
)

class HttpxSSE:

    EVENT_SOURCE = AST.ClassReference(
        qualified_name_excluding_import=("EventSource",),
        import_=AST.ReferenceImport(module=HTTPX_SSE),
    )
