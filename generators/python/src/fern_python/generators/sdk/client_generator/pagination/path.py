from typing import Optional

from .abstract_paginator import PaginationSnippetConfig, Paginator
from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

import fern.ir.resources as ir_types


class PathPagination(Paginator):
    """
    Path pagination generates code that follows a path from the response
    to fetch subsequent pages. Instead of re-invoking the endpoint method,
    it makes a direct HTTP request using the path combined with the default base URL.
    """

    PARSED_RESPONSE_NEXT_VARIABLE = "_parsed_next"
    FETCH_NEXT_PAGE_FUNC = "_fetch_next_page"
    NEXT_RESPONSE_VAR = "_next_response"
    NEXT_PARSED_VAR = "_next_parsed"
    NEXT_ITEMS_VAR = "_next_items"
    NEXT_NEXT_VAR = "_next_next"
    NEXT_HAS_NEXT_VAR = "_next_has_next"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        is_async: bool,
        pydantic_parse_expression: AST.Expression,
        config: PaginationSnippetConfig,
        path: ir_types.PathPagination,
        response_body_type: AST.TypeHint,
        http_method: str,
        client_wrapper_member_name: str,
        response_is_optional: bool = False,
    ):
        super().__init__(context, is_async, pydantic_parse_expression, config, response_is_optional)
        self.path = path
        self._response_body_type = response_body_type
        self._http_method = http_method
        self._client_wrapper_member_name = client_wrapper_member_name
        self._next_none_safe_condition = self._get_none_safe_property_condition(self.path.next_path)
        self._next_property = (
            f"{Paginator.PARSED_RESPONSE_VARIABLE}.{self._response_property_to_dot_access(self.path.next_path)}"
        )

    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{Paginator.PAGINATION_HAS_NEXT_VARIABLE} = False")
        writer.write_line(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{PathPagination.PARSED_RESPONSE_NEXT_VARIABLE} = {self._next_property}")

    def get_next_none_safe_condition(self) -> Optional[str]:
        return self._next_none_safe_condition

    def init_has_next(self) -> str:
        return f'{PathPagination.PARSED_RESPONSE_NEXT_VARIABLE} is not None and {PathPagination.PARSED_RESPONSE_NEXT_VARIABLE} != ""'

    def init_get_next(self, *, writer: AST.NodeWriter) -> None:
        results_dot_access = self._response_property_to_dot_access(self.path.results)
        next_dot_access = self._response_property_to_dot_access(self.path.next_path)

        results_none_safe = self._get_none_safe_property_condition_with_prefix(
            self.path.results, PathPagination.NEXT_PARSED_VAR
        )
        next_none_safe = self._get_none_safe_property_condition_with_prefix(
            self.path.next_path, PathPagination.NEXT_PARSED_VAR
        )

        items_expr = f"{PathPagination.NEXT_PARSED_VAR}.{results_dot_access}"
        next_expr = f"{PathPagination.NEXT_PARSED_VAR}.{next_dot_access}"

        # Build items with null-safe access
        if results_none_safe is not None:
            items_assignment = f"{PathPagination.NEXT_ITEMS_VAR} = {items_expr} if {results_none_safe} else []"
        else:
            items_assignment = f"{PathPagination.NEXT_ITEMS_VAR} = {items_expr}"

        # Build next path extraction
        if next_none_safe is not None:
            next_assignment = f"{PathPagination.NEXT_NEXT_VAR} = {next_expr} if {next_none_safe} else None"
        else:
            next_assignment = f"{PathPagination.NEXT_NEXT_VAR} = {next_expr}"

        client_ref = f"self.{self._client_wrapper_member_name}.httpx_client"

        # Write the _fetch_next_page function
        if self._is_async:
            writer.write_line(f"async def {PathPagination.FETCH_NEXT_PAGE_FUNC}(_next_path):")
        else:
            writer.write_line(f"def {PathPagination.FETCH_NEXT_PAGE_FUNC}(_next_path):")

        with writer.indent():
            # Make HTTP request - Path uses positional path arg with default base URL
            if self._is_async:
                writer.write(f"{PathPagination.NEXT_RESPONSE_VAR} = await {client_ref}.request(")
            else:
                writer.write(f"{PathPagination.NEXT_RESPONSE_VAR} = {client_ref}.request(")
            writer.write(f'method="{self._http_method}", url=_next_path')
            writer.write_line(")")

            # Parse response
            parse_expression = self._context.core_utilities.get_construct(
                self._response_body_type,
                AST.Expression(f"{PathPagination.NEXT_RESPONSE_VAR}.json()"),
            )
            writer.write(f"{PathPagination.NEXT_PARSED_VAR} = ")
            writer.write_node(parse_expression)
            writer.write_newline_if_last_line_not()

            # Extract items
            writer.write_line(items_assignment)

            # Extract next path
            writer.write_line(next_assignment)

            # Check has_next
            writer.write_line(
                f'{PathPagination.NEXT_HAS_NEXT_VAR} = {PathPagination.NEXT_NEXT_VAR} is not None and {PathPagination.NEXT_NEXT_VAR} != ""'
            )

            # Return pager
            pager_expr = self._context.core_utilities.instantiate_paginator(
                is_async=self._is_async,
                has_next=AST.Expression(PathPagination.NEXT_HAS_NEXT_VAR),
                items=AST.Expression(PathPagination.NEXT_ITEMS_VAR),
                get_next=AST.Expression(
                    f"(lambda _p={PathPagination.NEXT_NEXT_VAR}: {PathPagination.FETCH_NEXT_PAGE_FUNC}(_p)) if {PathPagination.NEXT_HAS_NEXT_VAR} else None"
                ),
                response=AST.Expression(PathPagination.NEXT_PARSED_VAR),
            )
            writer.write("return ")
            writer.write_node(pager_expr)
            writer.write_newline_if_last_line_not()

        # Assign _get_next to call the helper
        writer.write_line(
            f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = lambda _p={PathPagination.PARSED_RESPONSE_NEXT_VARIABLE}: {PathPagination.FETCH_NEXT_PAGE_FUNC}(_p)"
        )

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.path.results

    def _get_none_safe_property_condition_with_prefix(
        self, response_property: ir_types.ResponseProperty, prefix: str
    ) -> Optional[str]:
        if response_property.property_path is None or len(response_property.property_path) == 0:
            return None
        condition = ""
        property_path = response_property.property_path.copy()
        built_path = f"{prefix}."
        for idx, prop in enumerate(property_path):
            if idx > 0:
                built_path += "."
                condition += " and "
            built_path += f"{prop.name.snake_case.safe_name}"
            condition += f"{built_path} is not None"
        return condition
