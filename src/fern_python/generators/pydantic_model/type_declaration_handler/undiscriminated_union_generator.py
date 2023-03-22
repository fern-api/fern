from typing import Optional

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context import PydanticGeneratorContext
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
    ):
        super().__init__(context=context, custom_config=custom_config, source_file=source_file, docs=docs)
        self._name = name
        self._union = union

    def generate(self) -> None:

        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(
                    *(self._context.get_type_hint_for_type_reference(member.type) for member in self._union.members)
                ),
                name=self._name.name.pascal_case.safe_name,
            ),
            should_export=True,
        )
