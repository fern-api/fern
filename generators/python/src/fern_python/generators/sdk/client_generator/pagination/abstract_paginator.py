from abc import abstractmethod
from typing import List, Optional

from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

import fern.ir.resources as ir_types


# Duplicative of snippets,
# but we don't need the complexity of snippets here,
# to reinvoke the function call with slightly tweaked params
class PaginationSnippetConfig:
    endpoint_name: str
    parameters: List[AST.FunctionParameter]
    named_parameters: List[AST.NamedFunctionParameter]

    def __init__(
        self,
        endpoint_name: str,
        parameters: List[AST.FunctionParameter],
        named_parameters: List[AST.NamedFunctionParameter],
    ) -> None:
        self.endpoint_name = endpoint_name
        self.parameters = parameters
        self.named_parameters = named_parameters


# Base class that will help support different pagination
# schemes that are added to the python generator
class Paginator:
    PARSED_RESPONSE_VARIABLE = "_parsed_response"
    PAGINATION_GET_NEXT_VARIABLE = "_get_next"
    PAGINATION_HAS_NEXT_VARIABLE = "_has_next"
    PAGINATION_ITEMS_VARIABLE = "_items"

    def __init__(
        self,
        context: SdkGeneratorContext,
        is_async: bool,
        pydantic_parse_expression: AST.Expression,
        config: PaginationSnippetConfig,
    ):
        self._context = context
        self._is_async = is_async
        self._pydantic_parse_expression = pydantic_parse_expression
        self._config = config

    @abstractmethod
    def init_custom_vars_pre_next(self, *, writer: AST.NodeWriter) -> None: ...

    @abstractmethod
    def init_custom_vars_after_next(self, *, writer: AST.NodeWriter) -> None: ...

    @abstractmethod
    def get_next_none_safe_condition(self) -> Optional[str]: ...

    @abstractmethod
    def init_has_next(self) -> str: ...

    @abstractmethod
    def init_get_next(self, *, writer: AST.NodeWriter) -> None: ...

    @abstractmethod
    def get_results_property(self) -> ir_types.ResponseProperty: ...

    def init_parsed_response(self, writer: AST.NodeWriter) -> None:
        writer.write(f"{Paginator.PARSED_RESPONSE_VARIABLE} = ")
        writer.write_node(self._pydantic_parse_expression)
        writer.write_newline_if_last_line_not()

    def access_results_property_path(self) -> str:
        return f"{self._response_property_to_dot_access(self.get_results_property())}"

    def write(self, *, writer: AST.NodeWriter) -> None:
        self.init_parsed_response(writer=writer)

        items_non_safe_condition = self._get_none_safe_property_condition(self.get_results_property())
        results_property = f"{Paginator.PARSED_RESPONSE_VARIABLE}.{self.access_results_property_path()}"
        if items_non_safe_condition is not None:
            writer.write_node(
                AST.VariableDeclaration(
                    name=Paginator.PAGINATION_ITEMS_VARIABLE,
                    initializer=AST.Expression(
                        AST.ConditionalExpression(
                            test=AST.Expression(items_non_safe_condition),
                            left=AST.Expression(results_property),
                            right=AST.Expression("[]"),
                        )
                    ),
                )
            )
        else:
            writer.write_node(
                AST.VariableDeclaration(
                    name=Paginator.PAGINATION_ITEMS_VARIABLE,
                    initializer=AST.Expression(results_property),
                )
            )

        def init_vars(writer: AST.NodeWriter) -> None:
            # Step 1: Initialize custom variables
            self.init_custom_vars_after_next(writer=writer)

            # Step 2: Initialize has_next
            writer.write_line(f"{Paginator.PAGINATION_HAS_NEXT_VARIABLE} = {self.init_has_next()}")

            # Step 3: Initialize get_next
            self.init_get_next(writer=writer)

        next_none_safe_condition = self.get_next_none_safe_condition()
        if next_none_safe_condition is not None:
            self.init_custom_vars_pre_next(writer=writer)
            writer.write_line(f"if {next_none_safe_condition}:")
            with writer.indent():
                init_vars(writer=writer)
        else:
            init_vars(writer=writer)

        # Step 4: Instantiate paginator
        paginator_expr = self._context.core_utilities.instantiate_paginator(
            items=AST.Expression(Paginator.PAGINATION_ITEMS_VARIABLE),
            has_next=AST.Expression(Paginator.PAGINATION_HAS_NEXT_VARIABLE),
            get_next=AST.Expression(Paginator.PAGINATION_GET_NEXT_VARIABLE),
            response=AST.Expression(Paginator.PARSED_RESPONSE_VARIABLE),
            is_async=self._is_async,
        )

        writer.write_node(AST.ReturnStatement(value=paginator_expr))
        writer.write_newline_if_last_line_not()

    def _get_none_safe_property_condition(self, response_property: ir_types.ResponseProperty) -> Optional[str]:
        if response_property.property_path is None or len(response_property.property_path) == 0:
            return None
        condition = ""
        property_path = response_property.property_path.copy()
        built_path = f"{Paginator.PARSED_RESPONSE_VARIABLE}."
        for idx, property in enumerate(property_path):
            if idx > 0:
                built_path += "."
                condition += " and "
            built_path += f"{property.name.snake_case.safe_name}"
            condition += f"{built_path} is not None"
        return condition

    # Need to do null-safe dereferencing here, with some fallback value
    def _response_property_to_dot_access(self, response_property: ir_types.ResponseProperty) -> str:
        property_path = list(map(lambda path_item: path_item.name, response_property.property_path or []))
        property_path.append(response_property.property.name.name)
        path_name = list(map(lambda name: name.snake_case.safe_name, property_path))
        return ".".join(path_name)
