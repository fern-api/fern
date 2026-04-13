from dataclasses import dataclass
from typing import Optional

from fern_python.codegen import AST

import fern.ir.resources as ir_types


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
    # The raw type hint without pydantic.Field() annotation, for use in validators and other
    # non-field contexts. If None, use type_hint directly.
    raw_type_hint: Optional[AST.TypeHint] = None

    def get_type_hint_for_validators(self) -> AST.TypeHint:
        """Get the type hint suitable for validator signatures (without pydantic.Field metadata)."""
        return self.raw_type_hint if self.raw_type_hint is not None else self.type_hint


@dataclass(frozen=True)
class FernAwarePydanticField(BasePydanticField):
    type_reference: ir_types.TypeReference
    default_value: Optional[AST.Expression] = None
    description: Optional[str] = None
