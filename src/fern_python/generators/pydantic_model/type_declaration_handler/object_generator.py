from typing import Optional

import fern.ir.pydantic as ir_types

from fern_python.codegen import SourceFile

from ..context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


class ObjectGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        object: ir_types.ObjectTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
    ):
        super().__init__(name=name, context=context, custom_config=custom_config, source_file=source_file, docs=docs)
        self._object = object

    def generate(self) -> None:
        with FernAwarePydanticModel(
            type_name=self._name,
            extends=self._object.extends,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
        ) as pydantic_model:
            for property in self._object.properties:
                pydantic_model.add_field(
                    name=property.name.name.snake_case.unsafe_name,
                    pascal_case_field_name=property.name.name.pascal_case.unsafe_name,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                    description=property.docs,
                )
