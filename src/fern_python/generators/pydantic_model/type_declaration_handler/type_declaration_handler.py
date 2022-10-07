import ir as ir_types

from fern_python.declaration_handler import (
    DeclarationHandler,
    DeclarationHandlerContext,
)

from ..custom_config import CustomConfig
from .alias_generator import AliasGenerator
from .enum_generator import EnumGenerator
from .object_generator import ObjectGenerator
from .union_generator import UnionGenerator


class TypeDeclarationHandler(DeclarationHandler[ir_types.TypeDeclaration]):
    def __init__(
        self,
        declaration: ir_types.TypeDeclaration,
        context: DeclarationHandlerContext,
        custom_config: CustomConfig,
    ):
        super().__init__(declaration=declaration, context=context)
        self._custom_config = custom_config

    def run(self) -> None:
        generator = self._declaration.shape.visit(
            alias=lambda alias: AliasGenerator(
                name=self._declaration.name, alias=alias, context=self._context, custom_config=self._custom_config
            ),
            enum=lambda enum: EnumGenerator(
                name=self._declaration.name, enum=enum, context=self._context, custom_config=self._custom_config
            ),
            object=lambda object: ObjectGenerator(
                name=self._declaration.name, object=object, context=self._context, custom_config=self._custom_config
            ),
            union=lambda union: UnionGenerator(
                name=self._declaration.name, union=union, context=self._context, custom_config=self._custom_config
            ),
        )
        generator.generate()
