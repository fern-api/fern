from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


class ObjectGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        object: ir_types.ObjectTypeDeclaration,
        context: DeclarationHandlerContext,
    ):
        super().__init__(name=name, context=context)
        self._object = object

    def generate(self) -> None:
        with FernAwarePydanticModel(
            type_name=self._name,
            extends=self._object.extends,
            context=self._context,
        ) as pydantic_model:
            for property in self._object.properties:
                pydantic_model.add_field(
                    name=property.name.snake_case,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                )
