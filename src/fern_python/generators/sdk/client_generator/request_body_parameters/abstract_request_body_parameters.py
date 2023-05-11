from abc import abstractmethod
from typing import List, Optional

from fern_python.codegen import AST


class AbstractRequestBodyParameters:
    @abstractmethod
    def get_parameters(self) -> List[AST.NamedFunctionParameter]:
        ...

    @abstractmethod
    def get_reference_to_request_body(self) -> AST.Expression:
        ...

    @abstractmethod
    def get_files(self) -> Optional[AST.Expression]:
        ...

    @abstractmethod
    def get_pre_fetch_statements(self) -> Optional[AST.CodeWriter]:
        ...
