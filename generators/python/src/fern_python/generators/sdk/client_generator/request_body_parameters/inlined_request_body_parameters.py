from typing import Dict, List, Optional, Tuple, Union

from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters
from .flattened_request_body_parameter_utils import (
    are_any_properties_optional_in_inlined_request,
    get_json_body_for_inlined_request,
)
from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.declarations.function.named_function_parameter import (
    NamedFunctionParameter,
)
from fern_python.generators.pydantic_model.model_utilities import can_tr_be_fern_model
from fern_python.utils.name_resolver import get_name_from_wire_value, get_wire_value, resolve_name

import fern.ir.resources as ir_types


class InlinedRequestBodyParameters(AbstractRequestBodyParameters):
    _REQUEST_VARIABLE_NAME = "_request"

    def __init__(
        self,
        endpoint: ir_types.HttpEndpoint,
        request_body: ir_types.InlinedRequestBody,
        context: SdkGeneratorContext,
    ):
        self._endpoint = endpoint
        self._request_body = request_body
        self._context = context
        self._are_any_properties_optional = are_any_properties_optional_in_inlined_request(
            context, self._get_all_properties_for_inlined_request_body()
        )

    def _get_unwrap_path(self) -> Optional[List[str]]:
        unwrap_path = getattr(self._request_body, "unwrapPath", None)
        if unwrap_path is not None and len(unwrap_path) > 0:
            return list(unwrap_path)
        return None

    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body():
            if not self._is_type_literal(property.value_type):
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )
                maybe_default = self._context.pydantic_generator_context.get_initializer_for_type_reference(
                    property.value_type
                )
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=self._get_property_name(property),
                        docs=property.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            property.value_type,
                            in_endpoint=True,
                        ),
                        initializer=maybe_default
                        if maybe_default is not None
                        else AST.Expression(DEFAULT_BODY_PARAMETER_VALUE)
                        if type_hint.is_optional
                        else None,
                        raw_type=property.value_type,
                        raw_name=get_wire_value(property.name),
                    ),
                )
        return parameters

    def _get_non_parameter_properties(self) -> List[AST.NamedFunctionParameter]:
        non_param_properties = []

        parameters: List[AST.NamedFunctionParameter] = self.get_parameters()
        parameter_names = [parameter.name for parameter in parameters]
        for property in self._get_all_properties_for_inlined_request_body():
            if self._get_property_name(property) not in parameter_names:
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )
                non_param_properties.append(
                    AST.NamedFunctionParameter(
                        name=self._get_property_name(property),
                        docs=property.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            property.value_type,
                            in_endpoint=True,
                        ),
                        initializer=AST.Expression(DEFAULT_BODY_PARAMETER_VALUE) if type_hint.is_optional else None,
                        raw_type=property.value_type,
                        raw_name=get_wire_value(property.name),
                    ),
                )
        return non_param_properties

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    def _get_all_properties_for_inlined_request_body(self) -> List[ir_types.InlinedRequestBodyProperty]:
        unwrap_path = self._get_unwrap_path()
        if unwrap_path is not None:
            return self._get_unwrapped_properties(unwrap_path)
        return self._get_raw_top_level_properties()

    def _get_raw_top_level_properties(self) -> List[ir_types.InlinedRequestBodyProperty]:
        properties = self._request_body.properties.copy()
        for extension in self._request_body.extends:
            properties.extend(
                [
                    ir_types.InlinedRequestBodyProperty(
                        name=extended_property.name,
                        value_type=extended_property.value_type,
                        docs=extended_property.docs,
                    )
                    for extended_property in (
                        self._context.pydantic_generator_context.get_all_properties_including_extensions(
                            extension.type_id
                        )
                    )
                ]
            )
        return properties

    def _get_unwrapped_properties(self, unwrap_path: List[str]) -> List[ir_types.InlinedRequestBodyProperty]:
        result: List[ir_types.InlinedRequestBodyProperty] = []
        all_top_level = self._get_raw_top_level_properties()
        path_root = unwrap_path[0]

        for prop in all_top_level:
            if get_wire_value(prop.name) != path_root:
                result.append(prop)

        path_prop = next((p for p in all_top_level if get_wire_value(p.name) == path_root), None)
        if path_prop is None:
            return result

        current_type_ref = path_prop.value_type
        for i in range(1, len(unwrap_path)):
            segment = unwrap_path[i]
            current_props = self._resolve_object_properties(current_type_ref)
            if current_props is None:
                return result
            next_prop = next((p for p in current_props if get_wire_value(p.name) == segment), None)
            if next_prop is None:
                return result
            current_type_ref = next_prop.value_type

        leaf_props = self._resolve_object_properties(current_type_ref)
        if leaf_props is not None:
            for prop in leaf_props:
                result.append(
                    ir_types.InlinedRequestBodyProperty(
                        name=prop.name,
                        value_type=prop.value_type,
                        docs=prop.docs,
                    )
                )

        return result

    def _resolve_object_properties(
        self, type_ref: ir_types.TypeReference
    ) -> Optional[List[ir_types.ObjectProperty]]:
        type_union = type_ref.get_as_union()
        if type_union.type != "named":
            return None
        try:
            return self._context.pydantic_generator_context.get_all_properties_including_extensions(type_union.type_id)
        except RuntimeError:
            return None

    def _get_properties(self) -> List[NamedFunctionParameter]:
        return self.get_parameters() + self._get_non_parameter_properties()

    def _get_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return resolve_name(get_name_from_wire_value(property.name)).snake_case.safe_name

    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]:
        unwrap_path = self._get_unwrap_path()
        if unwrap_path is not None:
            return self._build_unwrapped_json_body(unwrap_path)
        return get_json_body_for_inlined_request(
            self._context,
            self._get_properties(),
        )

    def _build_unwrapped_json_body(self, unwrap_path: List[str]) -> Optional[AST.Expression]:
        context = self._context
        all_top_level = self._get_raw_top_level_properties()
        path_root = unwrap_path[0]
        top_non_path = [p for p in all_top_level if get_wire_value(p.name) != path_root]

        path_prop = next((p for p in all_top_level if get_wire_value(p.name) == path_root), None)
        if path_prop is None:
            return get_json_body_for_inlined_request(context, self._get_properties())

        intermediate_levels: List[Tuple[List[ir_types.ObjectProperty], str]] = []
        current_type_ref = path_prop.value_type

        for i in range(1, len(unwrap_path)):
            segment = unwrap_path[i]
            props = self._resolve_object_properties(current_type_ref)
            if props is None:
                return get_json_body_for_inlined_request(context, self._get_properties())

            literal_props = [
                p for p in props
                if get_wire_value(p.name) != segment and self._is_type_literal(p.value_type)
            ]
            intermediate_levels.append((literal_props, segment))

            next_prop = next((p for p in props if get_wire_value(p.name) == segment), None)
            if next_prop is None:
                return get_json_body_for_inlined_request(context, self._get_properties())
            current_type_ref = next_prop.value_type

        leaf_props_ir = self._resolve_object_properties(current_type_ref) or []

        all_params = self._get_properties()
        param_by_wire: Dict[str, NamedFunctionParameter] = {}
        for p in all_params:
            if p.raw_name is not None:
                param_by_wire[p.raw_name] = p

        def write_param(writer: AST.NodeWriter, param: NamedFunctionParameter) -> None:
            possible_literal = (
                context.get_literal_value(param.raw_type) if param.raw_type is not None else None
            )
            if possible_literal is not None and type(possible_literal) is str:
                writer.write_line(f'"{param.raw_name}": "{possible_literal}",')
            elif possible_literal is not None and type(possible_literal) is bool:
                writer.write_line(f'"{param.raw_name}": {possible_literal},')
            else:
                writer.write(f'"{param.raw_name}": ')
                if (
                    param.raw_type is not None
                    and (
                        context.custom_config.pydantic_config.use_typeddict_requests
                        or not context.custom_config.pydantic_config.use_pydantic_field_aliases
                    )
                    and can_tr_be_fern_model(param.raw_type, context.get_types())
                ):
                    unwrapped_tr = context.unwrap_optional_type_reference(param.raw_type)
                    type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrapped_tr,
                        in_endpoint=True,
                        for_typeddict=context.custom_config.pydantic_config.use_typeddict_requests,
                    )
                    reference = (
                        context.core_utilities.convert_and_respect_annotation_metadata(
                            object_=AST.Expression(param.name), annotation=type_hint
                        )
                        if can_tr_be_fern_model(param.raw_type, context.get_types())
                        else AST.Expression(param.name)
                    )
                    writer.write_node(reference)
                    writer.write_line(",")
                else:
                    writer.write_line(f"{param.name},")

        def write_literal_prop(writer: AST.NodeWriter, prop: ir_types.ObjectProperty) -> None:
            wire = get_wire_value(prop.name)
            lit_val = context.get_literal_value(reference=prop.value_type)
            if lit_val is not None and type(lit_val) is str:
                writer.write_line(f'"{wire}": "{lit_val}",')
            elif lit_val is not None and type(lit_val) is bool:
                writer.write_line(f'"{wire}": {lit_val},')

        def write_ir_prop(writer: AST.NodeWriter, prop_ir: ir_types.ObjectProperty) -> None:
            wire = get_wire_value(prop_ir.name)
            param = param_by_wire.get(wire)
            if param is not None:
                write_param(writer, param)
            elif self._is_type_literal(prop_ir.value_type):
                write_literal_prop(writer, prop_ir)

        def write_nested(writer: AST.NodeWriter, depth: int) -> None:
            if depth >= len(intermediate_levels):
                for prop_ir in leaf_props_ir:
                    write_ir_prop(writer, prop_ir)
                return

            lit_props, next_segment = intermediate_levels[depth]
            for lp in lit_props:
                write_literal_prop(writer, lp)

            writer.write(f'"{next_segment}": ')
            writer.write_line("{")
            with writer.indent():
                write_nested(writer, depth + 1)
            writer.write_line("},")

        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for prop_ir in top_non_path:
                    wire = get_wire_value(prop_ir.name)
                    param = param_by_wire.get(wire)
                    if param is not None:
                        write_param(writer, param)
                    elif self._is_type_literal(prop_ir.value_type):
                        lit_val = context.get_literal_value(reference=prop_ir.value_type)
                        if lit_val is not None and type(lit_val) is str:
                            writer.write_line(f'"{wire}": "{lit_val}",')
                        elif lit_val is not None and type(lit_val) is bool:
                            writer.write_line(f'"{wire}": {lit_val},')

                writer.write(f'"{path_root}": ')
                writer.write_line("{")
                with writer.indent():
                    write_nested(writer, 0)
                writer.write_line("},")
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write))

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return self._are_any_properties_optional

    def get_content(self) -> Optional[AST.Expression]:
        return None

    def get_parameter_name_rewrites(self) -> Dict[Union[str, ir_types.Name], str]:
        return {}
