from typing import Optional

from .abstract_paginator import PaginationSnippetConfig, Paginator
from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.utils.name_resolver import resolve_name

import fern.ir.resources as ir_types


class UriPagination(Paginator):
    """
    Uri pagination generates code that follows a full URI from the response
    to fetch subsequent pages. Instead of re-invoking the endpoint method,
    it makes a direct HTTP request to the next URI.
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
        uri: ir_types.UriPagination,
        response_body_type: AST.TypeHint,
        http_method: str,
        client_wrapper_member_name: str,
        response_is_optional: bool = False,
    ):
        super().__init__(context, is_async, pydantic_parse_expression, config, response_is_optional)
        self.uri = uri
        self._response_body_type = response_body_type
        self._http_method = http_method
        self._client_wrapper_member_name = client_wrapper_member_name
        self._next_none_safe_condition = self._get_none_safe_property_condition(self.uri.next_uri)
        self._next_property = (
            f"{Paginator.PARSED_RESPONSE_VARIABLE}.{self._response_property_to_dot_access(self.uri.next_uri)}"
        )

    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{Paginator.PAGINATION_HAS_NEXT_VARIABLE} = False")
        writer.write_line(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{UriPagination.PARSED_RESPONSE_NEXT_VARIABLE} = {self._next_property}")

    def get_next_none_safe_condition(self) -> Optional[str]:
        return self._next_none_safe_condition

    def init_has_next(self) -> str:
        return f'{UriPagination.PARSED_RESPONSE_NEXT_VARIABLE} is not None and {UriPagination.PARSED_RESPONSE_NEXT_VARIABLE} != ""'

    def init_get_next(self, *, writer: AST.NodeWriter) -> None:
        results_dot_access = self._response_property_to_dot_access(self.uri.results)
        next_dot_access = self._response_property_to_dot_access(self.uri.next_uri)

        results_none_safe = self._get_none_safe_property_condition_with_prefix(
            self.uri.results, UriPagination.NEXT_PARSED_VAR
        )
        next_none_safe = self._get_none_safe_property_condition_with_prefix(
            self.uri.next_uri, UriPagination.NEXT_PARSED_VAR
        )

        items_expr = f"{UriPagination.NEXT_PARSED_VAR}.{results_dot_access}"
        next_expr = f"{UriPagination.NEXT_PARSED_VAR}.{next_dot_access}"

        # Build items with null-safe access
        if results_none_safe is not None:
            items_assignment = f"{UriPagination.NEXT_ITEMS_VAR} = {items_expr} if {results_none_safe} else []"
        else:
            items_assignment = f"{UriPagination.NEXT_ITEMS_VAR} = {items_expr}"

        # Build next url extraction
        if next_none_safe is not None:
            next_assignment = f"{UriPagination.NEXT_NEXT_VAR} = {next_expr} if {next_none_safe} else None"
        else:
            next_assignment = f"{UriPagination.NEXT_NEXT_VAR} = {next_expr}"

        client_ref = f"self.{self._client_wrapper_member_name}.httpx_client"

        # Write the _fetch_next_page function
        if self._is_async:
            writer.write_line(f"async def {UriPagination.FETCH_NEXT_PAGE_FUNC}(_next_url):")
        else:
            writer.write_line(f"def {UriPagination.FETCH_NEXT_PAGE_FUNC}(_next_url):")

        with writer.indent():
            # Make HTTP request - Uri uses base_url for full URI
            if self._is_async:
                writer.write(f"{UriPagination.NEXT_RESPONSE_VAR} = await {client_ref}.request(")
            else:
                writer.write(f"{UriPagination.NEXT_RESPONSE_VAR} = {client_ref}.request(")
            writer.write(f'method="{self._http_method}", base_url=_next_url')
            writer.write_line(")")

            # Parse response
            parse_expression = self._context.core_utilities.get_construct(
                self._response_body_type,
                AST.Expression(f"{UriPagination.NEXT_RESPONSE_VAR}.json()"),
            )
            writer.write(f"{UriPagination.NEXT_PARSED_VAR} = ")
            writer.write_node(parse_expression)
            writer.write_newline_if_last_line_not()

            # Extract items
            writer.write_line(items_assignment)

            # Extract next url
            writer.write_line(next_assignment)

            # Check has_next
            writer.write_line(
                f'{UriPagination.NEXT_HAS_NEXT_VAR} = {UriPagination.NEXT_NEXT_VAR} is not None and {UriPagination.NEXT_NEXT_VAR} != ""'
            )

            # Return pager
            pager_expr = self._context.core_utilities.instantiate_paginator(
                is_async=self._is_async,
                has_next=AST.Expression(UriPagination.NEXT_HAS_NEXT_VAR),
                items=AST.Expression(UriPagination.NEXT_ITEMS_VAR),
                get_next=AST.Expression(
                    f"(lambda _url={UriPagination.NEXT_NEXT_VAR}: {UriPagination.FETCH_NEXT_PAGE_FUNC}(_url)) if {UriPagination.NEXT_HAS_NEXT_VAR} else None"
                ),
                response=AST.Expression(UriPagination.NEXT_PARSED_VAR),
            )
            writer.write("return ")
            writer.write_node(pager_expr)
            writer.write_newline_if_last_line_not()

        # Assign _get_next to call the helper
        writer.write_line(
            f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = lambda _url={UriPagination.PARSED_RESPONSE_NEXT_VARIABLE}: {UriPagination.FETCH_NEXT_PAGE_FUNC}(_url)"
        )

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.uri.results

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
            built_path += f"{resolve_name(prop.name).snake_case.safe_name}"
            condition += f"{built_path} is not None"
        return condition
