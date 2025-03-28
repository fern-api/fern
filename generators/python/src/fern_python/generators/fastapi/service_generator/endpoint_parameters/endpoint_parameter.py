from abc import ABC, abstractmethod

from ...context import FastApiGeneratorContext

from fern_python.codegen import AST


class EndpointParameter(ABC):
    def __init__(self, context: FastApiGeneratorContext):
        super().__init__()
        self._context = context

    def to_function_parameter(self) -> AST.NamedFunctionParameter:
        return AST.NamedFunctionParameter(name=self.get_name(), type_hint=self.get_type())

    def get_name(self) -> str:
        unsafe_name = self._get_unsafe_name()
        if unsafe_name == self._get_request_param_name():
            return f"{unsafe_name}_param"
        return unsafe_name

    @abstractmethod
    def _get_unsafe_name(self) -> str: ...

    @abstractmethod
    def get_type(self) -> AST.TypeHint: ...

    @abstractmethod
    def get_default(self) -> AST.Expression: ...

    def _get_request_param_name(self) -> str:
        return "body"
