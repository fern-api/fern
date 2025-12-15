from abc import ABC, abstractmethod
from typing import Optional


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
    def get_fastapi_marker(self) -> AST.Expression: ...

    # If this returns None, the parameter remains "required" (i.e. no Python default).
    # If this returns a value (e.g. None / []), it will be used as the Python default in the
    # generated signature, while the FastAPI marker is provided via typing.Annotated.
    def get_python_default(self) -> Optional[AST.Expression]:
        return None

    def _get_request_param_name(self) -> str:
        return "body"
