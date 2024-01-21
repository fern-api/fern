from dataclasses import dataclass
from typing import Optional

from fern_python.codegen import AST


@dataclass(frozen=True)
class PydanticField:
    name: str
    pascal_case_field_name: str
    type_hint: AST.TypeHint
    json_field_name: str
    default_value: Optional[AST.Expression] = None
    default_factory: Optional[AST.Expression] = None
    description: Optional[str] = None
