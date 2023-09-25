from dataclasses import dataclass

from fern_python.codegen import AST


@dataclass
class GeneratedRootClient:
    async_instantiation: AST.Expression
    sync_instantiation: AST.Expression
