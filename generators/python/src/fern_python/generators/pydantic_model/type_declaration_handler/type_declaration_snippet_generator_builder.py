from typing import Optional, TYPE_CHECKING

from ...context.pydantic_generator_context import PydanticGeneratorContext
from .enum_generator import EnumSnippetGenerator
from .pydantic_models.pydantic_model_alias_generator import (
    PydanticModelAliasSnippetGenerator,
)
from .pydantic_models.pydantic_model_object_generator import (
    PydanticModelObjectSnippetGenerator,
)
from .pydantic_models.pydantic_model_simple_discriminated_union_generator import (
    PydanticModelDiscriminatedUnionSnippetGenerator,
)
from .pydantic_models.pydantic_model_undiscriminated_union_generator import (
    PydanticModelUndiscriminatedUnionSnippetGenerator,
)
from .typeddicts.typeddict_alias_generator import TypedDictAliasSnippetGenerator
from .typeddicts.typeddict_object_generator import TypeddictObjectSnippetGenerator
from .typeddicts.typeddict_simple_discriminated_union_generator import (
    TypeddictDiscriminatedUnionSnippetGenerator,
)
from .typeddicts.typeddict_undiscriminated_union_generator import (
    TypeddictUndiscriminatedUnionSnippetGenerator,
)
from fern_python.codegen import AST
from fern_python.snippet import SnippetWriter, TypeDeclarationSnippetGenerator

import fern.ir.resources as ir_types

if TYPE_CHECKING:
    from fern_python.snippet.recursion_guard import RecursionGuard


class TypeDeclarationSnippetGeneratorBuilder:
    def __init__(
        self,
        context: PydanticGeneratorContext,
        snippet_writer: SnippetWriter,
    ):
        self._context = context
        self._snippet_writer = snippet_writer

    def get_generator(
        self,
    ) -> TypeDeclarationSnippetGenerator:
        return TypeDeclarationSnippetGenerator(
            alias=lambda example, recursion_guard=None: self._get_alias_snippet_generator(example, recursion_guard),
            enum=lambda name, example, recursion_guard=None: EnumSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=name,
                example=example,
                use_str_enums=self._context.use_str_enums,
            ).generate_snippet(recursion_guard),
            object=lambda name, example, recursion_guard=None: self._get_object_snippet_generator(name, example, recursion_guard),
            discriminated_union=lambda name, example, recursion_guard=None: self._get_discriminated_union_snippet_generator(name, example, recursion_guard),
            undiscriminated_union=lambda name, example, recursion_guard=None: self._get_undiscriminated_union_snippet_generator(
                name, example, recursion_guard
            ),
        )

    def _get_alias_snippet_generator(self, example: ir_types.ExampleAliasType, recursion_guard: Optional["RecursionGuard"] = None) -> Optional[AST.Expression]:
        if self._context.use_typeddict_requests:
            return TypedDictAliasSnippetGenerator(
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet(recursion_guard)

        return PydanticModelAliasSnippetGenerator(
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet(recursion_guard)

    def _get_object_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleObjectType, recursion_guard: Optional["RecursionGuard"] = None
    ) -> AST.Expression:
        if self._context.use_typeddict_requests:
            return TypeddictObjectSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet(recursion_guard)

        return PydanticModelObjectSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet(recursion_guard)

    def _get_discriminated_union_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleUnionType, recursion_guard: Optional["RecursionGuard"] = None
    ) -> AST.Expression:
        if self._context.use_typeddict_requests:
            return TypeddictDiscriminatedUnionSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
                union_naming_version=self._context.union_naming_version,
            ).generate_snippet(recursion_guard)

        return PydanticModelDiscriminatedUnionSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
            union_naming_version=self._context.union_naming_version,
        ).generate_snippet(recursion_guard)

    def _get_undiscriminated_union_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleUndiscriminatedUnionType, recursion_guard: Optional["RecursionGuard"] = None
    ) -> Optional[AST.Expression]:
        if self._context.use_typeddict_requests:
            return TypeddictUndiscriminatedUnionSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet(recursion_guard)

        return PydanticModelUndiscriminatedUnionSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet(recursion_guard)
