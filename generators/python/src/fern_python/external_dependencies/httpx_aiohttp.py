from fern_python.codegen import AST

HTTPX_AIOHTTP_DEPENDENCY = AST.Dependency(
    name="httpx_aiohttp",
    version="0.1.9",
    compatibility=AST.DependencyCompatibility.GREATER_THAN_OR_EQUAL,
    optional=True
)

AIOHTTP_DEPENDENCY = AST.Dependency(
    name="aiohttp",
    version="3.0.0",
    compatibility=AST.DependencyCompatibility.GREATER_THAN_OR_EQUAL,
    optional=True
)