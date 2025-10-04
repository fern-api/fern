from typing import List, Optional

import fern.ir.resources as ir_types
from ...context.sdk_generator_context import SdkGeneratorContext

from fern_python.codegen import AST
from fern_python.generators.pydantic_model.model_utilities import can_tr_be_fern_model

_REQUEST_VARIABLE_NAME = "_request"


def _get_property_name(property: ir_types.InlinedRequestBodyProperty) -> str:
    return property.name.name.snake_case.safe_name


def get_json_body_for_inlined_request(
    context: SdkGeneratorContext,
    properties: List[AST.NamedFunctionParameter],
) -> Optional[AST.Expression]:
    def write(writer: AST.NodeWriter) -> None:
        writer.write_line("{")
        with writer.indent():
            for property in properties:
                property_name = property.name
                possible_literal_value = (
                    context.get_literal_value(property.raw_type) if property.raw_type is not None else None
                )
                if possible_literal_value is not None and type(possible_literal_value) is str:
                    writer.write_line(f'"{property.raw_name}": "{possible_literal_value}",')
                elif possible_literal_value is not None and type(possible_literal_value) is bool:
                    writer.write_line(f'"{property.raw_name}": {possible_literal_value},')
                else:
                    writer.write(f'"{property.raw_name}": ')
                    if (
                        property.raw_type is not None
                        and (
                            context.custom_config.pydantic_config.use_typeddict_requests
                            or not context.custom_config.pydantic_config.use_pydantic_field_aliases
                        )
                        and can_tr_be_fern_model(property.raw_type, context.get_types())
                    ):
                        # We don't need any optional wrappings for the coercion here.
                        unwrapped_tr = context.unwrap_optional_type_reference(property.raw_type)
                        type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
                            unwrapped_tr,
                            in_endpoint=True,
                            for_typeddict=context.custom_config.pydantic_config.use_typeddict_requests,
                        )
                        reference = (
                            context.core_utilities.convert_and_respect_annotation_metadata(
                                object_=AST.Expression(property_name), annotation=type_hint
                            )
                            if can_tr_be_fern_model(property.raw_type, context.get_types())
                            else AST.Expression(property_name)
                        )
                        writer.write_node(reference)
                        writer.write_line(",")
                    else:
                        writer.write_line(f"{property_name},")
        writer.write_line("}")

    return AST.Expression(AST.CodeWriter(write))


def are_any_properties_optional_in_inlined_request(
    context: SdkGeneratorContext, properties: List[ir_types.InlinedRequestBodyProperty]
) -> bool:
    return any(
        context.pydantic_generator_context.get_type_hint_for_type_reference(
            body_property.value_type,
            in_endpoint=True,
        ).is_optional
        for body_property in properties
    )
