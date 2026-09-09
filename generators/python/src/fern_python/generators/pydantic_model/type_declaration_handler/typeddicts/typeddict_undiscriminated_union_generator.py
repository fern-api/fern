from typing import List, Optional

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..undiscriminated_union_generator import (
    AbstractUndiscriminatedUnionGenerator,
    AbstractUndiscriminatedUnionSnippetGenerator,
    CycleAwareMemberType,
    MemberWithBaseProperties,
)
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.typeddict import FernTypedDict
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.utils import get_name_from_wire_value, get_wire_value, resolve_name

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
        member_type_hints: List[AST.TypeHint] = [self._get_member_type_hint(member) for member in self._members]
        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(*member_type_hints),
                name=self._get_class_name(as_request=True),
            ),
            should_export=True,
        )

    def _get_member_type_hint(self, member: CycleAwareMemberType) -> AST.TypeHint:
        member_with_base = self._get_member_with_base_properties(member, as_request=True)
        if member_with_base is not None:
            return AST.TypeHint(self._generate_member_with_base_properties(member_with_base))
        return self._context.get_type_hint_for_type_reference(
            member.type,
            in_endpoint=True,
            # NOTE: Do not use NotRequired inside a Union generic
            for_typeddict=False,
            as_if_type_checking_import=member.is_circular_reference,
        )

    def _generate_member_with_base_properties(self, member_with_base: MemberWithBaseProperties) -> AST.ClassReference:
        with FernTypedDict(
            context=self._context,
            source_file=self._source_file,
            class_name=member_with_base.class_name,
            original_type_id=self._name.type_id,
            should_export=True,
        ) as member_typed_dict:
            for property in member_with_base.properties:
                member_typed_dict.add_field(
                    name=resolve_name(get_name_from_wire_value(property.name)).snake_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=get_wire_value(property.name),
                    description=property.docs,
                )
            return member_typed_dict.to_reference()


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
