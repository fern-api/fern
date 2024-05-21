from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE

_REQUEST_VARIABLE_NAME = "_request"


def _get_property_name(property: ir_types.InlinedRequestBodyProperty) -> str:
    return property.name.name.snake_case.safe_name


def get_json_body_for_inlined_request(
    context: SdkGeneratorContext,
    properties: List[AST.NamedFunctionParameter],
    are_any_properties_optional: bool,
) -> Optional[AST.Expression]:
    if are_any_properties_optional:
        return AST.Expression(_REQUEST_VARIABLE_NAME)

    def write(writer: AST.NodeWriter) -> None:
        writer.write_line("{")
        with writer.indent():
            for property in properties:
                property_name = property.name
                possible_literal_value = context.get_literal_value(property.raw_type)
                if possible_literal_value is not None and type(possible_literal_value) is str:
                    writer.write_line(f'"{property.raw_name}": "{possible_literal_value}",')
                elif possible_literal_value is not None and type(possible_literal_value) is bool:
                    writer.write_line(f'"{property.raw_name}": {possible_literal_value},')
                else:
                    writer.write_line(f'"{property.raw_name}": {property_name},')
        writer.write_line("}")

    return AST.Expression(AST.CodeWriter(write))


def get_pre_fetch_statements_for_inlined_request(
    context: SdkGeneratorContext,
    properties: List[AST.NamedFunctionParameter],
    are_any_properties_optional: bool,
) -> Optional[AST.CodeWriter]:
    if not are_any_properties_optional:
        return None

    optional_properties: List[AST.NamedFunctionParameter] = []
    required_properties: List[AST.NamedFunctionParameter] = []
    for body_property in properties:
        type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
            body_property.raw_type,
            in_endpoint=True,
        )
        if type_hint.is_optional:
            optional_properties.append(body_property)
        else:
            required_properties.append(body_property)

    def write(writer: AST.NodeWriter) -> None:
        writer.write(f"{_REQUEST_VARIABLE_NAME}: ")
        writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.any()))
        writer.write(" = ")
        if len(required_properties) == 0:
            writer.write_line("{}")
        else:
            writer.write_line("{")
            with writer.indent():
                for required_property in required_properties:
                    literal_value = context.get_literal_value(reference=required_property.raw_type)
                    if literal_value is not None and type(literal_value) is str:
                        writer.write_line(f'"{required_property.raw_name}": "{literal_value}",')
                    elif literal_value is not None and type(literal_value) is bool:
                        writer.write_line(f'"{required_property.raw_name}": {literal_value},')
                    else:
                        writer.write_line(
                            f'"{required_property.raw_name}": {required_property.name},'
                        )
            writer.write_line("}")

        for optional_property in optional_properties:
            writer.write_line(f"if {optional_property.name} is not {DEFAULT_BODY_PARAMETER_VALUE}:")
            with writer.indent():
                writer.write_line(
                    f'{_REQUEST_VARIABLE_NAME}["{optional_property.raw_name}"] = {optional_property.name}'
                )

    return AST.CodeWriter(write)


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
