from abc import ABC, abstractmethod

from fern_python.codegen import AST

from ...context import FastApiGeneratorContext


class EndpointParameter(ABC):
    def __init__(self, context: FastApiGeneratorContext):
        super().__init__()
        self._context = context

    def to_function_parameter(self) -> AST.FunctionParameter:
        return AST.FunctionParameter(name=self.get_name(), type_hint=self.get_type())

    @abstractmethod
    def get_name(self) -> str:
        ...

    @abstractmethod
    def get_type(self) -> AST.TypeHint:
        ...

    @abstractmethod
    def get_default(self) -> AST.Expression:
        ...
