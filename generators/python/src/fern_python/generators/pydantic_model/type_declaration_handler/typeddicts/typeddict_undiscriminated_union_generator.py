from typing import Optional

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..undiscriminated_union_generator import (
    AbstractUndiscriminatedUnionGenerator,
    AbstractUndiscriminatedUnionSnippetGenerator,
)
from fern_python.codegen import AST, SourceFile
from fern_python.snippet.snippet_writer import SnippetWriter

import fern.ir.resources as ir_types


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
        def get_member_hint(member: ir_types.UndiscriminatedUnionMember) -> AST.TypeHint:
            is_circular_reference = self._context.does_type_reference_reference_other_type(
                member.type, self._name.type_id
            )
            return self._context.get_type_hint_for_type_reference(
                member.type,
                in_endpoint=True,
                # NOTE: Do not use NotRequired inside a Union generic
                for_typeddict=False,
                as_if_type_checking_import=is_circular_reference,
            )

        # TypedDicts are request-shaped, so the inlined union omits the forward-compat
        # `typing.Any` fallback (as_request=True).
        inlined_hint = self._context.get_inlined_undiscriminated_union_hint(
            members=self._union.members,
            as_request=True,
            get_member_hint=get_member_hint,
        )
        type_hint = inlined_hint or AST.TypeHint.union(
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
        )

        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=type_hint,
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
