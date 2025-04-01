from abc import ABC
from typing import Optional

from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.snippet import SnippetWriter

import fern.ir.resources as ir_types


class AbstractAliasGenerator(AbstractTypeGenerator, ABC):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        alias: ir_types.AliasTypeDeclaration,
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
        self._alias = alias
        self._type_hint = self._context.get_type_hint_for_type_reference(self._alias.alias_of)


class AbstractAliasSnippetGenerator(AbstractTypeSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        example: ir_types.ExampleAliasType,
        use_typeddict_request: bool,
        as_request: bool,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
        )

        self.use_typeddict_request = use_typeddict_request
        self.as_request = as_request
        self.example = example

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.value,
            use_typeddict_request=self.use_typeddict_request,
            as_request=self.as_request,
        )
