from typing import List, Optional, TYPE_CHECKING

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..object_generator import (
    AbstractObjectGenerator,
    AbstractObjectSnippetGenerator,
    ObjectProperty,
)
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.typeddict import FernTypedDict
from fern_python.snippet import SnippetWriter

import fern.ir.resources as ir_types

if TYPE_CHECKING:
    from fern_python.snippet.recursion_guard import RecursionGuard


class TypeddictObjectGenerator(AbstractObjectGenerator):
    def __init__(
        self,
        name: Optional[ir_types.DeclaredTypeName],
        extends: List[ir_types.DeclaredTypeName],
        properties: List[ObjectProperty],
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        class_name: Optional[str] = None,
        snippet: Optional[str] = None,
    ):
        super().__init__(
            name=name,
            extends=extends,
            properties=properties,
            context=context,
            source_file=source_file,
            custom_config=custom_config,
            docs=docs,
            class_name=class_name,
            snippet=snippet,
            as_request=True,
        )

    def generate(self) -> None:
        with FernTypedDict(
            context=self._context,
            source_file=self._source_file,
            type_name=self._name,
            should_export=True,
            extended_types=self._extends,
            docstring=self._docs,
            class_name=self._class_name,
        ) as typed_dict:
            for property in self._properties:
                typed_dict.add_field(
                    name=property.name.name.snake_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                    description=property.docs,
                )


class TypeddictObjectSnippetGenerator(AbstractObjectSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        )

    def generate_snippet(self, recursion_guard: Optional["RecursionGuard"] = None) -> AST.Expression:
        return FernTypedDict.type_to_snippet(example=self.example, snippet_writer=self.snippet_writer, recursion_guard=recursion_guard)
