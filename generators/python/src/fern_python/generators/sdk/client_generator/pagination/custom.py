from typing import Optional

from .abstract_paginator import PaginationSnippetConfig, Paginator
from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

import fern.ir.resources as ir_types


class CustomPagination(Paginator):
    """
    Custom pagination implementation for Python SDK.

    This uses the standard Paginator pattern (returning SyncPager/AsyncPager)
    to ensure README and reference.md generation works correctly.

    For custom pagination, we set has_next=False and get_next=None as defaults,
    since custom pagination doesn't support automatic page fetching through the
    standard paginator interface. Users can implement their own pagination logic
    by extending the CustomPager base classes provided in the template.
    """

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        is_async: bool,
        pydantic_parse_expression: AST.Expression,
        config: PaginationSnippetConfig,
        custom: ir_types.CustomPagination,
    ):
        super().__init__(context, is_async, pydantic_parse_expression, config)
        self.custom = custom

    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None:
        # No custom vars needed for custom pagination
        pass

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        # No custom vars needed for custom pagination
        pass

    def get_next_none_safe_condition(self) -> Optional[str]:
        # Custom pagination doesn't need null safety checks
        return None

    def init_has_next(self) -> str:
        # Custom pagination doesn't support automatic page fetching
        return "False"

    def init_get_next(self, *, writer: AST.NodeWriter) -> None:
        # Custom pagination doesn't support automatic page fetching
        writer.write(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.custom.results
