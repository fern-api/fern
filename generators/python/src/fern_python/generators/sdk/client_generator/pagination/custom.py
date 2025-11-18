from typing import Optional

from .abstract_paginator import PaginationSnippetConfig, Paginator
from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

import fern.ir.resources as ir_types


class CustomPagination(Paginator):
    """
    Custom pagination implementation for Python SDK.
    
    This generates code that raises NotImplementedError, instructing SDK users
    to extend the CustomPager base class and implement their own pagination logic.
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
        return

    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None:
        # No custom vars needed for custom pagination  
        return

    def get_next_none_safe_condition(self) -> Optional[str]:
        # Custom pagination doesn't need null safety checks
        return None

    def init_has_next(self) -> str:
        # Custom pagination requires the user to implement this
        return "False"

    def init_get_next(self, *, writer: AST.NodeWriter) -> None:
        # Custom pagination requires the user to implement the get_next logic
        writer.write(f"{Paginator.PAGINATION_GET_NEXT_VARIABLE} = None")

    def get_results_property(self) -> ir_types.ResponseProperty:
        return self.custom.results
    
    def write(self, *, writer: AST.NodeWriter) -> None:
        """
        For custom pagination, we generate code that instantiates a user-provided
        CustomPager class with the parsed response and client wrapper.
        
        The user is expected to define CustomPager in their codebase, which will
        receive the initial response and can access the client for subsequent requests.
        
        Expected CustomPager signature:
        
        class CustomPager(Generic[T, R]):
            def __init__(
                self,
                *,
                initial_response: R,
                client_wrapper: SyncClientWrapper,  # or AsyncClientWrapper
            ):
                ...
        """
        # Parse the initial response
        self.init_parsed_response(writer=writer)
        
        pager_reference = self._context.core_utilities.get_custom_paginator_reference(self._is_async)
        
        # Instantiate CustomPager with the response and client wrapper
        writer.write("return ")
        writer.write_node(
            AST.ClassInstantiation(
                class_=pager_reference,
                kwargs=[
                    ("initial_response", AST.Expression(Paginator.PARSED_RESPONSE_VARIABLE)),
                    ("client_wrapper", AST.Expression("self._client_wrapper")),
                ],
            )
        )
        writer.write_newline_if_last_line_not()

