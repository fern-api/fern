from abc import abstractmethod
from typing import Dict, List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST


class AbstractRequestBodyParameters:
    @abstractmethod
    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]: ...

    @abstractmethod
    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]: ...

    @abstractmethod
    def get_files(self) -> Optional[AST.Expression]: ...

    @abstractmethod
    def is_default_body_parameter_used(self) -> bool: ...

    @abstractmethod
    def get_content(self) -> Optional[AST.Expression]: ...

    @abstractmethod
    def get_parameter_name_rewrites(self) -> Dict[ir_types.Name, str]: ...
