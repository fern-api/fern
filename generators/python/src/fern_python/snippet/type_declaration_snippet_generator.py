from typing import Callable, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

AliasSnippetGenerator = Callable[[ir_types.ExampleAliasType], Optional[AST.Expression]]
EnumSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleEnumType], AST.Expression]
ObjectSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleObjectType], AST.Expression]
DiscriminatedUnionGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleUnionType], AST.Expression]
UndiscriminatedUnionGenerator = Callable[
    [ir_types.DeclaredTypeName, ir_types.ExampleUndiscriminatedUnionType], Optional[AST.Expression]
]


class TypeDeclarationSnippetGenerator:
    def __init__(
        self,
        alias: AliasSnippetGenerator,
        enum: EnumSnippetGenerator,
        object: ObjectSnippetGenerator,
        discriminated_union: DiscriminatedUnionGenerator,
        undiscriminated_union: UndiscriminatedUnionGenerator,
    ):
        self._generate_alias = alias
        self._generate_enum = enum
        self._generate_object = object
        self._generate_discriminated_union = discriminated_union
        self._generate_undiscriminated_union = undiscriminated_union

    def generate_snippet(
        self,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleTypeShape,
    ) -> Optional[AST.Expression]:
        return example.visit(
            alias=lambda alias: self._generate_alias(alias),
            enum=lambda enum: self._generate_enum(name, enum),
            object=lambda object_: self._generate_object(name, object_),
            union=lambda union: self._generate_discriminated_union(name, union),
            undiscriminated_union=lambda union: self._generate_undiscriminated_union(name, union),
        )
