from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator


class UndiscriminatedUnionGenerator(AbstractTypeGenerator):
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
            context=context, custom_config=custom_config, source_file=source_file, docs=docs, snippet=snippet
        )
        self._name = name
        self._union = union

    def generate(self) -> None:
        type_alias_declaration = AST.TypeAliasDeclaration(
            type_hint=AST.TypeHint.union(
                *(
                    self._context.get_type_hint_for_type_reference(
                        member.type,
                        check_is_circular_reference=lambda other_type_name, current_type_name: self._context.does_type_reference_other_type(
                            other_type_name.type_id, current_type_name.type_id
                        ),
                    )
                    for member in self._union.members
                )
            ),
            name=self._name.name.pascal_case.safe_name,
        )
        for member in self._union.members:
            for type_id in self._context.get_referenced_types_of_type_reference(member.type):
                type_alias_declaration.add_ghost_reference(
                    self._context.get_class_reference_for_type_id(
                        type_id,
                        must_import_after_current_declaration=lambda other_type_name: self._context.does_type_reference_other_type(
                            other_type_name.type_id, type_id
                        ),
                    ),
                )

        self._source_file.add_declaration(
            type_alias_declaration,
            should_export=True,
        )
