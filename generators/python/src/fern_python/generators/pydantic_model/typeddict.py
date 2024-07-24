from __future__ import annotations

from typing import Optional, Sequence

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile

from ..context import PydanticGeneratorContext
from .custom_config import PydanticModelCustomConfig


# TODO(armando): DO THIS
class TypedDictNode:
    def __init__(
            self,
            context: PydanticGeneratorContext,
            source_file: SourceFile,
            custom_config: PydanticModelCustomConfig,
            class_name: str,
            type_name: Optional[ir_types.DeclaredTypeName],
            should_export: bool = True,
            extends: Sequence[ir_types.DeclaredTypeName] = [],
            docstring: Optional[str] = None,
            snippet: Optional[str] = None,
            force_update_forward_refs: bool = False,
        ):
        pass

    @classmethod
    def from_type_declaration(cls, type_declaration: ir_types.TypeDeclaration) -> Optional["TypedDictNode"]:
        pass

    def add_field(
        self,
        *,
        name: str,
        pascal_case_field_name: str,
        json_field_name: str,
        type_reference: ir_types.TypeReference,
        description: Optional[str] = None,
        default_value: Optional[AST.Expression] = None,
    ) -> None:
        pass

    def write_snippet(self) -> AST.Expression:
        return AST.Expression("TODO")