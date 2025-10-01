from dataclasses import dataclass
from typing import Callable, Optional, Tuple

import fern.ir.resources as ir_types
from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from .discriminated_union import DiscriminatedUnionWithUtilsGenerator
from .enum_generator import EnumGenerator
from .object_generator import ObjectProperty
from .pydantic_models.pydantic_model_alias_generator import PydanticModelAliasGenerator
from .pydantic_models.pydantic_model_object_generator import (
    PydanticModelObjectGenerator,
)
from .pydantic_models.pydantic_model_simple_discriminated_union_generator import (
    PydanticModelSimpleDiscriminatedUnionGenerator,
)
from .pydantic_models.pydantic_model_undiscriminated_union_generator import (
    PydanticModelUndiscriminatedUnionGenerator,
)
from .typeddicts.typeddict_alias_generator import TypedDictAliasGenerator
from .typeddicts.typeddict_object_generator import TypeddictObjectGenerator
from .typeddicts.typeddict_simple_discriminated_union_generator import (
    TypeddictSimpleDiscriminatedUnionGenerator,
)
from .typeddicts.typeddict_undiscriminated_union_generator import (
    TypeddictUndiscriminatedUnionGenerator,
)

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter


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
        generate_typeddict_request: bool,
    ):
        self._declaration = declaration
        self._context = context
        self._source_file = source_file
        self._custom_config = custom_config
        self._snippet_writer = snippet_writer
        self._generate_typeddict_request = generate_typeddict_request

    def run(self) -> GeneratedType:
        if self._generate_typeddict_request:
            snippet, generator = self._get_typeddict_generator()
            generator.generate()
        else:
            snippet, generator = self._get_pydantic_model_generator()
            generator.generate()

        return GeneratedType(
            snippet=snippet,
        )

    def _get_typeddict_generator(self) -> Tuple[Optional[AST.Expression], AbstractTypeGenerator]:
        docstring = None
        return None, self._declaration.shape.visit(
            alias=lambda alias: TypedDictAliasGenerator(
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
            object=lambda object_: TypeddictObjectGenerator(
                name=self._declaration.name,
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
            union=lambda union: TypeddictSimpleDiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
                should_generate=(not self._custom_config.include_union_utils),
            ),
            undiscriminated_union=lambda union: TypeddictUndiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
        )

    def _get_pydantic_model_generator(self) -> Tuple[Optional[AST.Expression], AbstractTypeGenerator]:
        snippet, docstring = self._get_snippet_for_type_declaration(self._declaration)
        type_generator = self._declaration.shape.visit(
            alias=lambda alias: PydanticModelAliasGenerator(
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
            object=lambda object_: PydanticModelObjectGenerator(
                name=self._declaration.name,
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
            union=self._get_pydantic_union_generator(docstring),
            undiscriminated_union=lambda union: PydanticModelUndiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=docstring,
            ),
        )

        return snippet, type_generator

    def _get_pydantic_union_generator(
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
            # Always try to generate the simple union, given we do not
            # generate TypedDicts with utils
            return PydanticModelSimpleDiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
                snippet=snippet,
                should_generate=(not self._custom_config.include_union_utils),
            )

        return get_union_generator

    def _get_snippet_for_type_declaration(
        self, declaration: ir_types.TypeDeclaration
    ) -> Tuple[Optional[AST.Expression], Optional[str]]:
        examples = self._declaration.user_provided_examples
        if len(examples) == 0:
            examples.extend(self._declaration.autogenerated_examples)

        if len(examples) == 0:
            return None, None
        expr = self._snippet_writer.get_snippet_for_example_type_shape(
            name=self._declaration.name,
            example_type_shape=examples[0].shape,
        )
        if expr is None:
            return None, None
        snippet = self._context.source_file_factory.create_snippet()
        snippet.add_expression(expr)
        return expr, snippet.to_str()
