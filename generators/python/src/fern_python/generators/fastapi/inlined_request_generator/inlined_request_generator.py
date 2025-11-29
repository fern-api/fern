import fern.ir.resources as ir_types
from ...pydantic_model.custom_config import PydanticModelCustomConfig
from ...pydantic_model.type_declaration_handler.object_generator import ObjectProperty
from ...pydantic_model.type_declaration_handler.pydantic_models.pydantic_model_object_generator import (
    PydanticModelObjectGenerator,
)
from ..context import FastApiGeneratorContext

from fern_python.codegen import SourceFile


class InlinedRequestGenerator:
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        service: ir_types.HttpService,
        request: ir_types.InlinedRequestBody,
        pydantic_model_custom_config: PydanticModelCustomConfig,
    ):
        self._context = context
        self._service = service
        self._request = request
        self._pydantic_model_custom_config = pydantic_model_custom_config

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        object_generator = PydanticModelObjectGenerator(
            name=None,
            class_name=self._context.get_class_name_for_inlined_request(
                service_name=self._service.name, request=self._request
            ),
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
