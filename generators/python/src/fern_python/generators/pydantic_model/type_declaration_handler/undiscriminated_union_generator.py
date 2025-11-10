from abc import ABC
from dataclasses import dataclass
from typing import List, Optional, TYPE_CHECKING

from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter

import fern.ir.resources as ir_types

if TYPE_CHECKING:
    from fern_python.snippet.recursion_guard import RecursionGuard


@dataclass(frozen=True)
class CycleAwareMemberType:
    is_circular_reference: bool
    type: ir_types.TypeReference


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

    def generate_snippet(self, recursion_guard: Optional["RecursionGuard"] = None) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.single_union_type,
            use_typeddict_request=self.use_typeddict_request,
            as_request=self.as_request,
            recursion_guard=recursion_guard,
        )
