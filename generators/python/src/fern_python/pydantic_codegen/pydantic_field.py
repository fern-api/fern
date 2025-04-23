from dataclasses import dataclass
from typing import Optional

from fern_python.codegen import AST

import fern.ir.resources as ir_types  # type: ignore[import-untyped]


@dataclass(frozen=True)
class BasePydanticField:
    name: str
    pascal_case_field_name: str
    json_field_name: str


@dataclass(frozen=True)
class PydanticField(BasePydanticField):
    type_hint: AST.TypeHint
    default_value: Optional[AST.Expression] = None
    default_factory: Optional[AST.Expression] = None
    description: Optional[str] = None


@dataclass(frozen=True)
class FernAwarePydanticField(BasePydanticField):
    type_reference: ir_types.TypeReference
    default_value: Optional[AST.Expression] = None
    description: Optional[str] = None
