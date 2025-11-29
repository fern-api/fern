from typing import Optional

import fern.ir.resources as ir_types
from .abstract_paginator import PaginationSnippetConfig, Paginator

from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


class CursorPagination(Paginator):
    PARSED_RESPONSE_NEXT_VARIABLE = "_parsed_next"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        is_async: bool,
        pydantic_parse_expression: AST.Expression,
        config: PaginationSnippetConfig,
        cursor: ir_types.CursorPagination,
    ):
        super().__init__(context, is_async, pydantic_parse_expression, config)
        self.cursor = cursor
        self._next_none_safe_condition = self._get_none_safe_property_condition(self.cursor.next)
        self._next_property = (
            f"{Paginator.PARSED_RESPONSE_VARIABLE}.{self._response_property_to_dot_access(self.cursor.next)}"
        )

    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{Paginator.PAGINATION_HAS_NEXT_VARIABLE} = False")
        writer.write_line(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{CursorPagination.PARSED_RESPONSE_NEXT_VARIABLE} = {self._next_property}")

    def get_next_none_safe_condition(self) -> Optional[str]:
        return self._next_none_safe_condition

    def init_has_next(self) -> str:
        return f'{CursorPagination.PARSED_RESPONSE_NEXT_VARIABLE} is not None and {CursorPagination.PARSED_RESPONSE_NEXT_VARIABLE} != ""'

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
        page_parameter_name = self.cursor.page.property.visit(
            body=lambda b: b.name.name.snake_case.safe_name, query=lambda q: q.name.name.snake_case.safe_name
        )
        writer.write(f"self.{self._config.endpoint_name}(")
        for parameter in self._config.parameters:
            # We currently assume the paging mechanism is a direct parameter (e.g. not nested)
            if parameter.name == page_parameter_name:
                writer.write(CursorPagination.PARSED_RESPONSE_NEXT_VARIABLE)
            else:
                writer.write(parameter.name)
            writer.write(", ")
        for parameter in self._config.named_parameters:
            if parameter.name == page_parameter_name:
                writer.write(f"{parameter.name}={CursorPagination.PARSED_RESPONSE_NEXT_VARIABLE}")
            else:
                writer.write(f"{parameter.name}={parameter.name}")
            writer.write(", ")
        writer.write(")")
        writer.write_line("")

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.cursor.results
