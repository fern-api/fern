import fern.ir.pydantic as ir_types

from fern_python.codegen import SourceFile

from ..context import PydanticGeneratorContext
from ..custom_config import CustomConfig
from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


class ObjectGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        object: ir_types.ObjectTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: CustomConfig,
    ):
        super().__init__(name=name, context=context, custom_config=custom_config, source_file=source_file)
        self._object = object

    def generate(self) -> None:
        with FernAwarePydanticModel(
            type_name=self._name,
            extends=self._object.extends,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
        ) as pydantic_model:
            for property in self._object.properties:
                pydantic_model.add_field(
                    name=property.name.snake_case,
                    pascal_case_field_name=property.name.pascal_case,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                )
