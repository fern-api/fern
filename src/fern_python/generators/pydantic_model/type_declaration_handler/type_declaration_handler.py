from dataclasses import dataclass
from typing import Callable, Optional, Tuple

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter
from fern_python.source_file_factory import SourceFileFactory

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator
from .alias_generator import AliasGenerator
from .discriminated_union import (
    DiscriminatedUnionWithUtilsGenerator,
    SimpleDiscriminatedUnionGenerator,
)
from .enum_generator import EnumGenerator
from .object_generator import ObjectGenerator, ObjectProperty
from .undiscriminated_union_generator import UndiscriminatedUnionGenerator


@dataclass
class GeneratedType:
    snippet: Optional[AST.Expression]


class TypeDeclarationHandler:
    def __init__(
        self,
        declaration: ir_types.TypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        snippet_writer: SnippetWriter,
    ):
        self._declaration = declaration
        self._context = context
        self._source_file = source_file
        self._custom_config = custom_config
        self._snippet_writer = snippet_writer

    def run(self) -> GeneratedType:
        snippet, docstring = self._get_snippet_for_type_declaration(self._declaration)
        generator = self._declaration.shape.visit(
            alias=lambda alias: AliasGenerator(
                name=self._declaration.name,
                alias=alias,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
            enum=lambda enum: EnumGenerator(
                name=self._declaration.name,
                enum=enum,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
            object=lambda object_: ObjectGenerator(
                name=self._declaration.name,
                class_name=self._context.get_class_name_for_type_id(self._declaration.name.type_id),
                extends=object_.extends,
                properties=[
                    ObjectProperty(
                        name=property.name,
                        value_type=property.value_type,
                        docs=property.docs,
                    )
                    for property in object_.properties
                ],
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
            union=self._get_union_generator(docstring),
            undiscriminated_union=lambda union: UndiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
        )
        generator.generate()

        return GeneratedType(
            snippet=snippet,
        )

    def _get_union_generator(
        self,
        snippet: Optional[str] = None,
    ) -> Callable[[ir_types.UnionTypeDeclaration], AbstractTypeGenerator]:
        def get_union_generator(union: ir_types.UnionTypeDeclaration) -> AbstractTypeGenerator:
            if self._custom_config.include_union_utils:
                return DiscriminatedUnionWithUtilsGenerator(
                    name=self._declaration.name,
                    union=union,
                    context=self._context,
                    custom_config=self._custom_config,
                    source_file=self._source_file,
                    docs=self._declaration.docs,
                    snippet=snippet,
                )
            else:
                return SimpleDiscriminatedUnionGenerator(
                    name=self._declaration.name,
                    union=union,
                    context=self._context,
                    custom_config=self._custom_config,
                    source_file=self._source_file,
                    docs=self._declaration.docs,
                    snippet=snippet,
                )

        return get_union_generator

    def _get_snippet_for_type_declaration(
        self, declaration: ir_types.TypeDeclaration
    ) -> Tuple[Optional[AST.Expression], Optional[str]]:
        if len(self._declaration.examples) == 0:
            return None, None
        expr = self._snippet_writer.get_snippet_for_example_type_shape(
            name=self._declaration.name,
            example_type_shape=declaration.examples[0].shape,
        )
        if expr is None:
            return None, None
        snippet = SourceFileFactory.create_snippet()
        snippet.add_expression(expr)
        return expr, snippet.to_str()
