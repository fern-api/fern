import fern.ir.pydantic as ir_types

from fern_python.codegen import SourceFile

from ...pydantic_model import ObjectGenerator, ObjectProperty, PydanticModelCustomConfig
from ..context import FastApiGeneratorContext


class InlinedRequestGenerator:
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        request: ir_types.InlinedRequestBody,
        pydantic_model_custom_config: PydanticModelCustomConfig,
    ):
        self._context = context
        self._request = request
        self._pydantic_model_custom_config = pydantic_model_custom_config

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        object_generator = ObjectGenerator(
            name=None,
            class_name=self._request.name.original_name,
            extends=self._request.extends,
            properties=[
                ObjectProperty(
                    name=property.name,
                    value_type=property.value_type,
                    docs=property.docs,
                )
                for property in self._request.properties
            ],
            context=self._context.pydantic_generator_context,
            custom_config=self._pydantic_model_custom_config,
            source_file=source_file,
            docs=None,
        )
        object_generator.generate()
