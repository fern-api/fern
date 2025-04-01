from abc import ABC, abstractmethod

from fern_python.codegen import AST

from ..context.fastapi_generator_context import FastApiGeneratorContext


class AbstractAuthGenerator(ABC):
    def __init__(self, context: FastApiGeneratorContext):
        self._context = context

    @abstractmethod
    def get_dependency(self) -> AST.Expression:
        ...

    @abstractmethod
    def get_parsed_auth_type(self) -> AST.TypeHint:
        ...
