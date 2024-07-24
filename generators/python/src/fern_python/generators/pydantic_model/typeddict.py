from __future__ import annotations

from typing import Dict, Optional, Sequence

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

    @classmethod
    def from_type_declaration(cls, type_declaration: ir_types.TypeDeclaration) -> Optional["TypedDictNode"]:
        pass

    @classmethod
    def _can_be_typeddict_tr(
        cls, tr: ir_types.TypeReference, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]
    ) -> bool:
        return tr.visit(
            named=lambda nt: TypedDictNode.can_be_typeddict(types[nt.type_id].shape, types),
            container=lambda ct: ct.visit(
                list_=lambda list_tr: TypedDictNode._can_be_typeddict_tr(list_tr, types),
                map_=lambda mt: TypedDictNode._can_be_typeddict_tr(mt.key_type, types)
                or TypedDictNode._can_be_typeddict_tr(mt.value_type, types),
                optional=lambda optional_tr: TypedDictNode._can_be_typeddict_tr(optional_tr, types),
                set_=lambda set_tr: TypedDictNode._can_be_typeddict_tr(set_tr, types),
                literal=lambda _: False,
            ),
            primitive=lambda _: False,
            unknown=lambda: False,
        )

    @classmethod
    def can_be_typeddict(cls, type_: ir_types.Type, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]) -> bool:
        return type_.visit(
            alias=lambda atd: atd.resolved_type.visit(
                named=lambda nt: nt.shape.visit(
                    enum=lambda: False,
                    object=lambda: True,
                    union=lambda: True,
                    undiscriminated_union=lambda: True,
                ),
                container=lambda ct: ct.visit(
                    list_=lambda list_tr: TypedDictNode._can_be_typeddict_tr(list_tr, types),
                    map_=lambda mt: TypedDictNode._can_be_typeddict_tr(mt.key_type, types)
                    or TypedDictNode._can_be_typeddict_tr(mt.value_type, types),
                    optional=lambda optional_tr: TypedDictNode._can_be_typeddict_tr(optional_tr, types),
                    set_=lambda set_tr: TypedDictNode._can_be_typeddict_tr(set_tr, types),
                    literal=lambda _: False,
                ),
                primitive=lambda _: False,
                unknown=lambda: False,
            ),
            enum=lambda _: False,
            object=lambda _: True,
            union=lambda _: True,
            undiscriminated_union=lambda _: True,
        )
