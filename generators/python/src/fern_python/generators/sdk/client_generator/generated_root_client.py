from dataclasses import dataclass
from typing import List

from fern_python.codegen import AST
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ConstructorParameter,
)


@dataclass
class RootClient:
    class_reference: AST.ClassReference
    parameters: List[ConstructorParameter]


@dataclass
class GeneratedRootClient:
    async_instantiation: AST.Expression
    async_client: RootClient
    sync_instantiation: AST.Expression
    sync_client: RootClient
