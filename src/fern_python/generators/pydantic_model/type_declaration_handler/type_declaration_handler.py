from fern_python.declaration_handler import DeclarationHandler
from fern_python.generated import ir_types

from .alias_generator import AliasGenerator
from .enum_generator import EnumGenerator
from .object_generator import ObjectGenerator
from .union_generator import UnionGenerator


class TypeDeclarationHandler(DeclarationHandler[ir_types.TypeDeclaration]):
    def run(self) -> None:
        generator = self._declaration.shape.visit(
            alias=lambda alias: AliasGenerator(name=self._declaration.name, alias=alias, context=self._context),
            enum=lambda enum: EnumGenerator(name=self._declaration.name, enum=enum, context=self._context),
            object=lambda object: ObjectGenerator(name=self._declaration.name, object=object, context=self._context),
            union=lambda union: UnionGenerator(name=self._declaration.name, union=union, context=self._context),
        )
        generator.generate()
