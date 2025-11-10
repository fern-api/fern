from typing import Callable, Optional

from fern_python.codegen import AST

import fern.ir.resources as ir_types

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .recursion_guard import RecursionGuard

AliasSnippetGenerator = Callable[[ir_types.ExampleAliasType, Optional["RecursionGuard"]], Optional[AST.Expression]]
EnumSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleEnumType, Optional["RecursionGuard"]], AST.Expression]
ObjectSnippetGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleObjectType, Optional["RecursionGuard"]], AST.Expression]
DiscriminatedUnionGenerator = Callable[[ir_types.DeclaredTypeName, ir_types.ExampleUnionType, Optional["RecursionGuard"]], AST.Expression]
UndiscriminatedUnionGenerator = Callable[
    [ir_types.DeclaredTypeName, ir_types.ExampleUndiscriminatedUnionType, Optional["RecursionGuard"]], Optional[AST.Expression]
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
        recursion_guard: Optional["RecursionGuard"] = None,
    ) -> Optional[AST.Expression]:
        return example.visit(
            alias=lambda alias: self._generate_alias(alias, recursion_guard),
            enum=lambda enum: self._generate_enum(name, enum, recursion_guard),
            object=lambda object_: self._generate_object(name, object_, recursion_guard),
            union=lambda union: self._generate_discriminated_union(name, union, recursion_guard),
            undiscriminated_union=lambda union: self._generate_undiscriminated_union(name, union, recursion_guard),
        )
