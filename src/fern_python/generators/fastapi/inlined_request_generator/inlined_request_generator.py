import fern.ir.pydantic as ir_types

from fern_python.codegen import SourceFile

from ....pydantic_codegen import PydanticField, PydanticModel
from ..context import FastApiGeneratorContext


class InlinedRequestGenerator:
    def __init__(self, context: FastApiGeneratorContext, request: ir_types.InlinedRequestBody):
        self._context = context
        self._request = request

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        with PydanticModel(
            source_file=source_file,
            name=self._request.name.pascal_case.unsafe_name,
            base_models=[
                self._context.pydantic_generator_context.get_class_reference_for_type_name(extension)
                for extension in self._request.extends
            ],
        ) as pydantic_model:
            for property in self._request.properties:
                pydantic_model.add_field(
                    PydanticField(
                        name=property.name.name.snake_case.unsafe_name,
                        pascal_case_field_name=property.name.name.pascal_case.unsafe_name,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            property.value_type
                        ),
                        json_field_name=property.name.wire_value,
                    )
                )
