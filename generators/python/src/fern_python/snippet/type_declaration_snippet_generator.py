from typing import Callable, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

AliasSnippetGenerator = Callable[[ir_types.ExampleAliasType, bool, bool], Optional[AST.Expression]]
EnumSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleEnumType], AST.Expression]
ObjectSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleObjectType, bool, bool], AST.Expression]
DiscriminatedUnionGenerator = Callable[
    [ir_types.DeclaredTypeName, ir_types.ExampleUnionType, bool, bool], AST.Expression
]
UndiscriminatedUnionGenerator = Callable[
    [ir_types.DeclaredTypeName, ir_types.ExampleUndiscriminatedUnionType, bool, bool], Optional[AST.Expression]
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
        use_typeddict_request: bool,
        as_request: bool,
    ) -> Optional[AST.Expression]:
        return example.visit(
            alias=lambda alias: self._generate_alias(alias, use_typeddict_request, as_request),
            enum=lambda enum: self._generate_enum(name, enum),
            object=lambda object_: self._generate_object(name, object_, use_typeddict_request, as_request),
            union=lambda union: self._generate_discriminated_union(name, union, use_typeddict_request, as_request),
            undiscriminated_union=lambda union: self._generate_undiscriminated_union(
                name, union, use_typeddict_request, as_request
            ),
        )
