from typing import List, Optional

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ...fern_aware_pydantic_model import FernAwarePydanticModel
from ..undiscriminated_union_generator import (
    AbstractUndiscriminatedUnionGenerator,
    AbstractUndiscriminatedUnionSnippetGenerator,
    CycleAwareMemberType,
    MemberWithBaseProperties,
)
from fern_python.codegen import AST, SourceFile
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.utils import get_name_from_wire_value, get_wire_value, resolve_name

import fern.ir.resources as ir_types


class PydanticModelUndiscriminatedUnionGenerator(AbstractUndiscriminatedUnionGenerator):
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
                name=self._get_class_name(as_request=False),
            ),
            should_export=True,
        )

    def _get_member_type_hint(self, member: CycleAwareMemberType) -> AST.TypeHint:
        member_with_base = self._get_member_with_base_properties(member, as_request=False)
        if member_with_base is not None:
            return AST.TypeHint(self._generate_member_with_base_properties(member_with_base))
        return self._context.get_type_hint_for_type_reference(
            member.type, as_if_type_checking_import=member.is_circular_reference
        )

    def _generate_member_with_base_properties(self, member_with_base: MemberWithBaseProperties) -> AST.ClassReference:
        with FernAwarePydanticModel(
            type_name=None,
            original_type_id=self._name.type_id,
            class_name=member_with_base.class_name,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=None,
        ) as member_pydantic_model:
            for property in member_with_base.properties:
                resolved_prop_name = resolve_name(get_name_from_wire_value(property.name))
                member_pydantic_model.add_field(
                    name=resolved_prop_name.snake_case.safe_name,
                    pascal_case_field_name=resolved_prop_name.pascal_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=get_wire_value(property.name),
                    description=property.docs,
                )
            return member_pydantic_model.to_reference()


class PydanticModelUndiscriminatedUnionSnippetGenerator(AbstractUndiscriminatedUnionSnippetGenerator):
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
            use_typeddict_request=False,
            as_request=False,
        )

    # generate_snippet delegates to the parent class AbstractUndiscriminatedUnionSnippetGenerator
