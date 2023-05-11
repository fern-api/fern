import fern.ir.resources as ir_types

from fern_python.codegen import SourceFile

from ..context import PydanticGeneratorContext
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


class TypeDeclarationHandler:
    def __init__(
        self,
        declaration: ir_types.TypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
    ):
        self._declaration = declaration
        self._context = context
        self._source_file = source_file
        self._custom_config = custom_config

    def run(self) -> None:
        generator = self._declaration.shape.visit(
            alias=lambda alias: AliasGenerator(
                name=self._declaration.name,
                alias=alias,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
            ),
            enum=lambda enum: EnumGenerator(
                name=self._declaration.name,
                enum=enum,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
            ),
            object=lambda object_: ObjectGenerator(
                name=self._declaration.name,
                class_name=self._context.get_class_name_for_type_name(self._declaration.name),
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
            ),
            union=self._get_union_generator,
            undiscriminated_union=lambda union: UndiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
            ),
        )
        generator.generate()

    def _get_union_generator(self, union: ir_types.UnionTypeDeclaration) -> AbstractTypeGenerator:
        if self._custom_config.include_union_utils:
            return DiscriminatedUnionWithUtilsGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
            )
        else:
            return SimpleDiscriminatedUnionGenerator(
                name=self._declaration.name,
                union=union,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docs=self._declaration.docs,
            )
