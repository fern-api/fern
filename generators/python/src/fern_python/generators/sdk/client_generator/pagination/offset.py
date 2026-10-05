from typing import Optional

from .abstract_paginator import PaginationSnippetConfig, Paginator
from fern_python.codegen import AST
from fern_python.generators.sdk.client_generator.request_properties import (
    request_property_to_name,
    retrieve_pagination_default,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.utils.name_resolver import resolve_name

import fern.ir.resources as ir_types


class OffsetPagination(Paginator):
    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        is_async: bool,
        pydantic_parse_expression: AST.Expression,
        config: PaginationSnippetConfig,
        offset: ir_types.OffsetPagination,
        response_is_optional: bool = False,
    ):
        super().__init__(context, is_async, pydantic_parse_expression, config, response_is_optional)
        self.offset = offset
        self._next_none_safe_condition = (
            self._get_none_safe_property_condition(self.offset.has_next_page)
            if self.offset.has_next_page is not None
            else None
        )

    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{Paginator.PAGINATION_HAS_NEXT_VARIABLE} = False")
        writer.write_line(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        return

    def get_next_none_safe_condition(self) -> Optional[str]:
        return self._next_none_safe_condition

    def init_has_next(self) -> str:
        if self.offset.has_next_page is not None:
            path = self._response_property_to_dot_access(self.offset.has_next_page)
            return f"bool({Paginator.PARSED_RESPONSE_VARIABLE}.{path})"
        return f"len({Paginator.PAGINATION_ITEMS_VARIABLE} or []) > 0"

    def init_get_next(self, *, writer: AST.NodeWriter) -> None:
        if self._is_async:
            writer.write(f"async def {Paginator.PAGINATION_GET_NEXT_VARIABLE}():")
            with writer.indent():
                writer.write("return await ")
                self.write_get_next_body(writer=writer)
        else:
            writer.write(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} =")
            writer.write("lambda: ")
            self.write_get_next_body(writer=writer)

    def write_get_next_body(self, *, writer: AST.NodeWriter) -> None:
        page_parameter_name = request_property_to_name(self.offset.page.property)
        property_path = self.offset.page.property_path or []
        # For a nested page property (e.g. `options.offset`) the parameter to rewrite is the
        # root of the path; otherwise it is the page property itself.
        rewritten_parameter_name = (
            resolve_name(property_path[0].name).snake_case.safe_name if property_path else page_parameter_name
        )
        writer.write(f"self.{self._config.endpoint_name}(")
        for parameter in self._config.parameters:
            if parameter.name == rewritten_parameter_name:
                self._write_next_page_value(writer=writer, parameter=parameter)
            else:
                writer.write(parameter.name)
            writer.write(", ")

        for named_parameter in self._config.named_parameters:
            writer.write(f"{named_parameter.name}=")
            if named_parameter.name == rewritten_parameter_name:
                self._write_next_page_value(writer=writer, parameter=named_parameter)
            else:
                writer.write(named_parameter.name)
            writer.write(", ")
        writer.write(")")
        writer.write_line("")

    def _write_next_page_value(self, *, writer: AST.NodeWriter, parameter: AST.FunctionParameter) -> None:
        parameter_name = parameter.name
        property_path = self.offset.page.property_path or []
        if not property_path:
            # The offset parameter is normalized to an integer before the request is made.
            writer.write(f"{parameter_name} + {self.get_step()}")
            return
        nested_keys = [resolve_name(item.name).snake_case.safe_name for item in property_path[1:]]
        nested_keys.append(request_property_to_name(self.offset.page.property))
        keys_literal = "[" + ", ".join(f'"{key}"' for key in nested_keys) + "]"
        default = retrieve_pagination_default(self.offset.page.property.get_as_union().value_type)
        writer.write_node(
            AST.Expression(self._context.core_utilities.get_reference_to_pagination_helper("with_nested_page_value"))
        )
        writer.write(f"({parameter_name}, {keys_literal}, ")
        writer.write_node(
            AST.Expression(self._context.core_utilities.get_reference_to_pagination_helper("get_nested_page_value"))
        )
        writer.write(f"({parameter_name}, {keys_literal}, {default}) + {self.get_step()}")
        if parameter.type_hint is not None:
            # Lets the helper build an omitted container through its model so field aliases apply.
            writer.write(", ")
            writer.write_node(parameter.type_hint)
        writer.write(")")

    def get_step(self) -> str:
        if self.offset.step is not None and self._context.custom_config.offset_semantics == "item-index":
            return f"len({Paginator.PAGINATION_ITEMS_VARIABLE} or [])"
        return "1"

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.offset.results
