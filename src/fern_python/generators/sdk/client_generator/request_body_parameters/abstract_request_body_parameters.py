from abc import abstractmethod
from typing import List

from fern_python.codegen import AST


class AbstractRequestBodyParameters:
    @abstractmethod
    def get_parameters(self) -> List[AST.FunctionParameter]:
        ...

    @abstractmethod
    def get_reference_to_request_body(self) -> AST.Expression:
        ...
