from abc import ABC
from dataclasses import dataclass
from typing import List, Optional

from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.utils import get_wire_value, resolve_name

import fern.ir.resources as ir_types


@dataclass(frozen=True)
class CycleAwareMemberType:
    is_circular_reference: bool
    type: ir_types.TypeReference


@dataclass(frozen=True)
class MemberWithBaseProperties:
    """An object-like union member that must be re-declared locally so the
    union's base properties can be merged into it."""

    class_name: str
    properties: List[ir_types.ObjectProperty]


class AbstractUndiscriminatedUnionGenerator(AbstractTypeGenerator, ABC):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        union: ir_types.UndiscriminatedUnionTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
        )
        self._name = name
        self._union = union

        # If the type reference is self-referencing or one of the members creates a circular reference, we need to
        # string reference the type and hide the import as `if TYPE_CHECKING` if an import is needed.
        self._members: List[CycleAwareMemberType] = [
            CycleAwareMemberType(
                is_circular_reference=self._context.does_type_reference_reference_other_type(
                    member.type, self._name.type_id
                ),
                type=member.type,
            )
            for member in self._union.members
        ]
        self._base_properties: List[ir_types.ObjectProperty] = list(self._union.base_properties or [])

    def _get_class_name(self, as_request: bool) -> str:
        return self._context.get_class_name_for_type_id(self._name.type_id, as_request=as_request)

    def _get_object_type_id(self, type_id: ir_types.TypeId) -> Optional[ir_types.TypeId]:
        """Returns the type id of the object declaration this named type resolves to, if any."""
        shape = self._context.get_declaration_for_type_id(type_id).shape.get_as_union()
        if shape.type == "object":
            return type_id
        if shape.type == "alias":
            resolved = shape.resolved_type.get_as_union()
            if resolved.type == "named":
                return self._get_object_type_id(resolved.name.type_id)
        return None

    def _get_member_with_base_properties(
        self, member: CycleAwareMemberType, as_request: bool
    ) -> Optional[MemberWithBaseProperties]:
        """For an object-like member of a union with base properties, describe the local class that
        combines the member's properties with the union's base properties. Returns None when the
        member should be referenced as-is."""
        if len(self._base_properties) == 0:
            return None
        member_union = member.type.get_as_union()
        if member_union.type != "named":
            return None
        object_type_id = self._get_object_type_id(member_union.type_id)
        if object_type_id is None:
            return None
        member_name = resolve_name(member_union.name).pascal_case.safe_name
        base_property_wire_names = {get_wire_value(property.name) for property in self._base_properties}
        return MemberWithBaseProperties(
            class_name=f"{self._get_class_name(as_request=as_request)}{member_name}",
            properties=[
                *self._base_properties,
                *(
                    property
                    for property in self._context.get_all_properties_including_extensions(object_type_id)
                    if get_wire_value(property.name) not in base_property_wire_names
                ),
            ],
        )


class AbstractUndiscriminatedUnionSnippetGenerator(AbstractTypeSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleUndiscriminatedUnionType,
        use_typeddict_request: bool,
        as_request: bool,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
        )
        self.name = name
        self.example = example
        self.as_request = as_request
        self.use_typeddict_request = use_typeddict_request

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.single_union_type,
            use_typeddict_request=self.use_typeddict_request,
            as_request=self.as_request,
        )
