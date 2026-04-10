from typing import Optional

import fern.ir.resources as ir_types
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
            alias=lambda example: self._get_alias_snippet_generator(example),
            enum=lambda name, example: EnumSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=name,
                example=example,
                use_str_enums=self._context.use_str_enums,
            ).generate_snippet(),
            object=lambda name, example: self._get_object_snippet_generator(name, example),
            discriminated_union=lambda name, example: self._get_discriminated_union_snippet_generator(name, example),
            undiscriminated_union=lambda name, example: self._get_undiscriminated_union_snippet_generator(
                name, example
            ),
        )

    def _get_alias_snippet_generator(self, example: ir_types.ExampleAliasType) -> Optional[AST.Expression]:
        if self._context.use_typeddict_requests:
            return TypedDictAliasSnippetGenerator(
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet()

        return PydanticModelAliasSnippetGenerator(
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet()

    def _get_object_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleObjectType
    ) -> AST.Expression:
        if self._context.use_typeddict_requests:
            return TypeddictObjectSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet()

        return PydanticModelObjectSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet()

    def _get_discriminated_union_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleUnionType
    ) -> AST.Expression:
        if self._context.use_typeddict_requests:
            return TypeddictDiscriminatedUnionSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
                union_naming_version=self._context.union_naming_version,
            ).generate_snippet()

        return PydanticModelDiscriminatedUnionSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
            union_naming_version=self._context.union_naming_version,
        ).generate_snippet()

    def _get_undiscriminated_union_snippet_generator(
        self, name: ir_types.DeclaredTypeName, example: ir_types.ExampleUndiscriminatedUnionType
    ) -> Optional[AST.Expression]:
        if self._context.use_typeddict_requests:
            return TypeddictUndiscriminatedUnionSnippetGenerator(
                name=name,
                snippet_writer=self._snippet_writer,
                example=example,
            ).generate_snippet()

        return PydanticModelUndiscriminatedUnionSnippetGenerator(
            name=name,
            snippet_writer=self._snippet_writer,
            example=example,
        ).generate_snippet()
