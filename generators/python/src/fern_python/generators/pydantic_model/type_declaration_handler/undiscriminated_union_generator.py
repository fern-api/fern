from abc import ABC
from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator


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

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.single_union_type,
            use_typeddict_request=self.use_typeddict_request,
            as_request=self.as_request,
        )
