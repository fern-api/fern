from typing import Optional

import fern.ir.resources as ir_types
from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..undiscriminated_union_generator import (
    AbstractUndiscriminatedUnionGenerator,
    AbstractUndiscriminatedUnionSnippetGenerator,
)

from fern_python.codegen import AST, SourceFile
from fern_python.snippet.snippet_writer import SnippetWriter


class TypeddictUndiscriminatedUnionGenerator(AbstractUndiscriminatedUnionGenerator):
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
            name=name,
            union=union,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
        )

    def generate(self) -> None:
        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(
                    *(
                        self._context.get_type_hint_for_type_reference(
                            member.type,
                            in_endpoint=True,
                            # NOTE: Do not use NotRequired inside a Union generic
                            for_typeddict=False,
                            as_if_type_checking_import=member.is_circular_reference,
                        )
                        for member in self._members
                    )
                ),
                name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=True),
            ),
            should_export=True,
        )


class TypeddictUndiscriminatedUnionSnippetGenerator(AbstractUndiscriminatedUnionSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleUndiscriminatedUnionType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            use_typeddict_request=True,
            as_request=True,
        )

    # generate_snippet delegates to the parent class AbstractUndiscriminatedUnionSnippetGenerator
