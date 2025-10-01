import re
from typing import Dict, List, Optional

import fern.generator_exec as generator_exec
import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.snippet.snippet_endpoint_expression import EndpointExpression
from fern_python.source_file_factory import SourceFileFactory


class SnippetRegistry:
    def __init__(self, *, source_file_factory: SourceFileFactory) -> None:
        self._snippets: Dict[ir_types.TypeId, AST.Expression] = {}
        self._endpoint_snippets: Dict[ir_types.EndpointId, AST.Expression] = {}
        self._sync_client_endpoint_snippets: Dict[ir_types.EndpointId, List[EndpointExpression]] = {}
        self._async_client_endpoint_snippets: Dict[ir_types.EndpointId, List[EndpointExpression]] = {}
        self._source_file_factory = source_file_factory

    def snippets(self) -> Optional[generator_exec.Snippets]:
        if (
            len(self._snippets) == 0
            and len(self._sync_client_endpoint_snippets) == 0
            and len(self._async_client_endpoint_snippets) == 0
        ):
            return None

        types: Dict[generator_exec.TypeId, str] = {}
        for typeId, expr in self._snippets.items():
            types[generator_exec.TypeId(typeId)] = self._expression_to_snippet_str(expr)

        endpoints: List[generator_exec.Endpoint] = []
        for endpointId, sync_endpoint_expressions in self._sync_client_endpoint_snippets.items():
            for idx, expression in enumerate(sync_endpoint_expressions):
                endpoints.append(
                    generator_exec.Endpoint(
                        id=expression.endpoint_id,
                        example_identifier=expression.example_id,
                        snippet=generator_exec.EndpointSnippet.factory.python(
                            value=generator_exec.PythonEndpointSnippet(
                                sync_client=self._expression_to_snippet_str(expression.expr),
                                async_client=self._expression_to_snippet_str(
                                    self._async_client_endpoint_snippets[endpointId][idx].expr
                                )
                                if endpointId in self._async_client_endpoint_snippets
                                else "",
                            )
                        ),
                    )
                )

        return generator_exec.Snippets(
            types=types,
            endpoints=endpoints,
        )

    def register_snippet(
        self,
        type_id: ir_types.TypeId,
        expr: AST.Expression,
    ) -> None:
        self._snippets[type_id] = expr

    def register_async_client_endpoint_snippet(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        expr: AST.Expression,
        example_id: str,
    ) -> None:
        init = self._async_client_endpoint_snippets.get(endpoint.id) or []
        init.append(
            EndpointExpression(
                endpoint_id=self._endpoint_to_identifier(endpoint),
                expr=expr,
                example_id=example_id,
            )
        )
        self._async_client_endpoint_snippets[endpoint.id] = init

    def register_sync_client_endpoint_snippet(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        expr: AST.Expression,
        example_id: str,
    ) -> None:
        init = self._sync_client_endpoint_snippets.get(endpoint.id) or []
        init.append(
            EndpointExpression(
                endpoint_id=self._endpoint_to_identifier(endpoint),
                expr=expr,
                example_id=example_id,
            )
        )
        self._sync_client_endpoint_snippets[endpoint.id] = init

    def _endpoint_to_identifier(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> generator_exec.EndpointIdentifier:
        return generator_exec.EndpointIdentifier(
            path=generator_exec.EndpointPath(self._full_path_for_endpoint(endpoint)),
            method=self._ir_method_to_generator_exec_method(endpoint.method),
            identifier_override=endpoint.id,
        )

    def _full_path_for_endpoint(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> str:
        components: List[str] = []
        if not endpoint.full_path.head.startswith("/"):
            components.append("/")
        if len(endpoint.full_path.head) > 0:
            components.append(endpoint.full_path.head)
        for part in endpoint.full_path.parts:
            components.append("{" + part.path_parameter + "}")
            if len(part.tail) > 0:
                components.append(part.tail)
        joined_components = "".join(components)
        return re.sub("/+", "/", joined_components)

    def _ir_method_to_generator_exec_method(
        self,
        method: ir_types.HttpMethod,
    ) -> generator_exec.EndpointMethod:
        if method is ir_types.HttpMethod.GET:
            return generator_exec.EndpointMethod.GET
        if method is ir_types.HttpMethod.POST or method is ir_types.HttpMethod.HEAD:
            return generator_exec.EndpointMethod.POST
        if method is ir_types.HttpMethod.PUT:
            return generator_exec.EndpointMethod.PUT
        if method is ir_types.HttpMethod.PATCH:
            return generator_exec.EndpointMethod.PATCH
        if method is ir_types.HttpMethod.DELETE:
            return generator_exec.EndpointMethod.DELETE

    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
        snippet = self._source_file_factory.create_snippet()
        snippet.add_expression(expr)
        return snippet.to_str()
