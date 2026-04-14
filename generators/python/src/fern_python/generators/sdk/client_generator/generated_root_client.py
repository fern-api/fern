from dataclasses import dataclass, field
from typing import List, Optional

from fern_python.codegen import AST
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ConstructorParameter,
)


@dataclass
class RootClient:
    class_reference: AST.ClassReference
    parameters: List[ConstructorParameter]
    init_parameters: Optional[List[ConstructorParameter]] = field(default=None)
    constructor_overloads: Optional[List[AST.FunctionSignature]] = field(default=None)


@dataclass
class GeneratedRootClient:
    async_instantiations: List[AST.Expression]
    async_client: RootClient
    sync_instantiations: List[AST.Expression]
    sync_client: RootClient

    @property
    def async_instantiation(self) -> AST.Expression:
        """Returns the primary/first async instantiation"""
        if not self.async_instantiations:
            raise ValueError(
                "No async instantiations available. GeneratedRootClientBuilder must create at least one instantiation."
            )
        return self.async_instantiations[0]

    @property
    def sync_instantiation(self) -> AST.Expression:
        """Returns the primary/first sync instantiation"""
        if not self.sync_instantiations:
            raise ValueError(
                "No sync instantiations available. GeneratedRootClientBuilder must create at least one instantiation."
            )
        return self.sync_instantiations[0]
