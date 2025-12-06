from typing import Dict, List, Optional, Tuple

import fern.generator_exec as generator_exec
import fern.ir.resources as ir_types
import generatorcli

from fern_python.codegen import AST
from fern_python.external_dependencies.httpx import HttpX
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadata,
    EndpointMetadataCollector,
)
from fern_python.generators.sdk.client_generator.generated_root_client import (
    GeneratedRootClient,
)
from fern_python.source_file_factory.source_file_factory import SourceFileFactory


class ReadmeSnippetBuilder:
    USAGE_FEATURE_ID: generatorcli.FeatureId = "USAGE"
    ASYNC_CLIENT_FEATURE_ID: generatorcli.FeatureId = "ASYNC_CLIENT"
    STREAMING_FEATURE_ID: generatorcli.FeatureId = "STREAMING"
    PAGINATION_FEATURE_ID: generatorcli.FeatureId = "PAGINATION"
    ACCESS_RAW_RESPONSE_DATA_FEATURE_ID: generatorcli.FeatureId = "ACCESS_RAW_RESPONSE_DATA"
    WEBSOCKETS_FEATURE_ID: generatorcli.FeatureId = "WEBSOCKETS"

    NO_FEATURE_PLACEHOLDER_ID: generatorcli.FeatureId = "NO_FEATURE"

    # TODO: Fill in the snippets for these sections, and add more as needed.
    EXCEPTION_HANDLING_FEATURE_ID: generatorcli.FeatureId = "EXCEPTION_HANDLING"
    RETRIES_FEATURE_ID: generatorcli.FeatureId = "RETRIES"
    TIMEOUTS_FEATURE_ID: generatorcli.FeatureId = "TIMEOUTS"
    CUSTOM_CLIENT_FEATURE_ID: generatorcli.FeatureId = "CUSTOM_CLIENT"

    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        package_name: str,
        snippets: generator_exec.Snippets,
        endpoint_metadata: EndpointMetadataCollector,
        generated_root_client: GeneratedRootClient,
        api_error_reference: AST.ClassReference,
        source_file_factory: SourceFileFactory,
        pagination_enabled: Optional[bool] = False,
        websocket_enabled: Optional[bool] = False,
    ):
        self._ir = ir
        self._package_name = package_name
        self._snippets = snippets
        # Pagination should really just be filtered out of the IR, this
        # is a recipe of disaster given how easy it is to forget to check these
        # flags and how many places need this context.
        self._pagination_enabled = pagination_enabled
        self._websocket_enabled = websocket_enabled

        self._source_file_factory = source_file_factory

        self._root_client = generated_root_client
        self._endpoint_metadata = endpoint_metadata
        self._api_error_reference = api_error_reference

        self._endpoint_map = self._build_endpoints(ir)
        self._endpoint_snippet_map = self._build_endpoint_snippet_map(snippets=snippets)
        self._endpoint_feature_map = self._build_endpoint_feature_map(ir)
        self._default_endpoint_id = self._get_default_endpoint_id(ir=ir, snippets=snippets)

    def build_readme_snippets(self) -> Dict[generatorcli.feature.FeatureId, List[str]]:
        snippets: Dict[generatorcli.feature.FeatureId, List[str]] = {}

        snippets[ReadmeSnippetBuilder.USAGE_FEATURE_ID] = self._build_usage_snippets()
        snippets[ReadmeSnippetBuilder.ASYNC_CLIENT_FEATURE_ID] = self._build_async_client_snippets()
        snippets[ReadmeSnippetBuilder.STREAMING_FEATURE_ID] = self._build_streaming_snippets()
        snippets[ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID] = self._build_exception_handling_snippets()
        snippets[ReadmeSnippetBuilder.RETRIES_FEATURE_ID] = self._build_retries_snippets()
        snippets[ReadmeSnippetBuilder.TIMEOUTS_FEATURE_ID] = self._build_timeout_snippets()
        snippets[ReadmeSnippetBuilder.CUSTOM_CLIENT_FEATURE_ID] = [self._build_custom_client_snippets()]

        if self._pagination_enabled:
            snippets[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID] = self._build_pagination_snippets()

        if self._websocket_enabled:
            snippets[ReadmeSnippetBuilder.WEBSOCKETS_FEATURE_ID] = self._build_websocket_snippets()

        snippets[ReadmeSnippetBuilder.ACCESS_RAW_RESPONSE_DATA_FEATURE_ID] = (
            self._build_access_raw_response_data_snippets()
        )

        return snippets

    def _build_usage_snippets(self) -> List[str]:
        try:
            usage_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
                feature_id=ReadmeSnippetBuilder.USAGE_FEATURE_ID
            )
            if usage_endpoint_ids is not None:
                return [self._endpoint_snippet_map[endpoint_id].sync_client for endpoint_id in usage_endpoint_ids]
            return [self._endpoint_snippet_map[self._default_endpoint_id].sync_client]
        except Exception as e:
            print(f"Failed to generate usage snippets with exception {e}")
            return []

    def _build_snippets_for_feature(self, feature_id: generatorcli.feature.FeatureId) -> List[str]:
        specified_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(feature_id=feature_id)
        if specified_endpoint_ids is not None:
            return [self._endpoint_snippet_map[endpoint_id].sync_client for endpoint_id in specified_endpoint_ids]

        endpoints_with_feature = self._filter_endpoint_ids_by_feature(feature_id)
        filtered_endpoints_with_feature = [e for e in endpoints_with_feature if e in self._endpoint_snippet_map]

        if len(filtered_endpoints_with_feature) > 0:
            return [self._endpoint_snippet_map[filtered_endpoints_with_feature[0]].sync_client]

        return []

    # Stolen from SnippetRegistry
    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
        snippet = self._source_file_factory.create_snippet()
        snippet.add_expression(expr)
        # For some reason we're appending newlines to snippets, so we need to strip them for templates
        return snippet.to_str()

    def _build_timeout_snippets(self) -> List[str]:
        try:
            retries_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
                feature_id=ReadmeSnippetBuilder.TIMEOUTS_FEATURE_ID
            ) or [self._default_endpoint_id]

            retry_snippets = []
            for endpoint_id in retries_endpoint_ids:
                endpoint = self._endpoint_metadata.get_endpoint_metadata(endpoint_id)
                if endpoint is not None:
                    has_parameters = self._endpoint_metadata.has_parameters(endpoint_id)

                    client_instantiation = AST.ClassInstantiation(
                        class_=self._root_client.sync_client.class_reference,
                        args=[AST.Expression("..."), AST.Expression("timeout=20.0")],
                    )

                    def _client_writer(writer: AST.NodeWriter) -> None:
                        writer.write("client = ")
                        writer.write_node(client_instantiation)

                    client_instantiation_str = self._expression_to_snippet_str(
                        AST.Expression(AST.CodeWriter(_client_writer))
                    )

                    retry_snippets.append(
                        f"""
{client_instantiation_str}

# Override timeout for a specific method
client.{endpoint.endpoint_package_path}{endpoint.method_name}({"..., " if has_parameters else ""}request_options={{
    "timeout_in_seconds": 1
}})
"""
                    )

            return retry_snippets
        except Exception as e:
            print(f"Failed to generage timeout snippets with exception {e}")
            return []

    def _build_exception_handling_snippets(self) -> List[str]:
        try:
            retries_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
                feature_id=ReadmeSnippetBuilder.RETRIES_FEATURE_ID
            ) or [self._default_endpoint_id]

            retry_snippets = []
            for endpoint_id in retries_endpoint_ids:
                endpoint = self._endpoint_metadata.get_endpoint_metadata(endpoint_id)
                if endpoint is not None:
                    has_parameters = self._endpoint_metadata.has_parameters(endpoint_id)

                    def _get_error_writer(current_endpoint: EndpointMetadata) -> AST.CodeWriterFunction:
                        def _error_writer(writer: AST.NodeWriter) -> None:
                            writer.write_line("try:")
                            with writer.indent():
                                writer.write_line(
                                    f"client.{current_endpoint.endpoint_package_path}{current_endpoint.method_name}({'...' if has_parameters else ''})"
                                )
                            writer.write("except ")
                            writer.write_node(AST.TypeHint(self._api_error_reference))
                            writer.write_line(" as e:")
                            with writer.indent():
                                writer.write_line("print(e.status_code)")
                                writer.write_line("print(e.body)")

                        return _error_writer

                    error_exception_str = self._expression_to_snippet_str(
                        AST.Expression(AST.CodeWriter(_get_error_writer(endpoint)))
                    )

                    retry_snippets.append(error_exception_str)

            return retry_snippets
        except Exception as e:
            print(f"Failed to generage exception handling snippets with exception {e}")
            return []

    def _build_access_raw_response_data_snippets(self) -> List[str]:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                AST.VariableDeclaration(
                    name="client",
                    initializer=AST.Expression(
                        AST.ClassInstantiation(
                            class_=self._root_client.sync_client.class_reference,
                            args=[AST.Expression("...")],
                        )
                    ),
                )
            )

            endpoints_with_pagination_feature = self._filter_endpoint_ids_by_feature(
                ReadmeSnippetBuilder.PAGINATION_FEATURE_ID
            )
            filtered_endpoints_with_pagination_feature = [
                e for e in endpoints_with_pagination_feature if e in self._endpoint_snippet_map
            ]
            pagination_endpoint_id = (
                filtered_endpoints_with_pagination_feature[0]
                if len(filtered_endpoints_with_pagination_feature) > 0
                else None
            )

            endpoints_with_streaming_feature = self._filter_endpoint_ids_by_feature(
                ReadmeSnippetBuilder.STREAMING_FEATURE_ID
            )
            filtered_endpoints_with_streaming_feature = [
                e for e in endpoints_with_streaming_feature if e in self._endpoint_snippet_map
            ]
            streaming_endpoint_id = (
                filtered_endpoints_with_streaming_feature[0]
                if len(filtered_endpoints_with_streaming_feature) > 0
                else None
            )

            # Only include the default endpoint if it's not a pagination or streaming endpoint, as we don't want to duplicate the snippets.
            if self._default_endpoint_id not in {pagination_endpoint_id, streaming_endpoint_id} and (
                endpoint := self._endpoint_metadata.get_endpoint_metadata(self._default_endpoint_id)
            ):
                writer.write_node(
                    AST.VariableDeclaration(
                        name="response",
                        initializer=AST.Expression(
                            f"client.{endpoint.endpoint_package_path}with_raw_response.{endpoint.method_name}({'...' if self._endpoint_metadata.has_parameters(self._default_endpoint_id) else ''})"
                        ),
                    )
                )
                writer.write_line("print(response.headers)  # access the response headers")
                writer.write_line("print(response.data)  # access the underlying object")

            if pagination_endpoint_id and (
                endpoint := self._endpoint_metadata.get_endpoint_metadata(pagination_endpoint_id)
            ):
                writer.write_node(
                    AST.VariableDeclaration(
                        name="pager",
                        initializer=AST.Expression(
                            f"client.{endpoint.endpoint_package_path}{endpoint.method_name}({'...' if self._endpoint_metadata.has_parameters(pagination_endpoint_id) else ''})"
                        ),
                    )
                )
                writer.write_line("print(pager.response)  # access the typed response for the first page")
                writer.write_node(
                    AST.ForStatement(
                        target="item",
                        iterable="pager",
                        body=[AST.Expression("print(item)  # access the underlying object(s)")],
                    )
                )
                writer.write_newline_if_last_line_not()
                writer.write_node(
                    AST.ForStatement(
                        target="page",
                        iterable="pager.iter_pages()",
                        body=[
                            AST.Expression("print(page.response)  # access the typed response for each page\n"),
                            AST.ForStatement(
                                target="item",
                                iterable="page",
                                body=[AST.Expression("print(item)  # access the underlying object(s)")],
                            ),
                        ],
                    )
                )
                writer.write_newline_if_last_line_not()

            if streaming_endpoint_id and (
                endpoint := self._endpoint_metadata.get_endpoint_metadata(streaming_endpoint_id)
            ):
                writer.write_node(
                    AST.WithStatement(
                        context_managers=[
                            AST.WithContextManager(
                                expression=AST.Expression(
                                    f"client.{endpoint.endpoint_package_path}with_raw_response.{endpoint.method_name}({'...' if self._endpoint_metadata.has_parameters(streaming_endpoint_id) else ''})"
                                ),
                                as_variable="response",
                            )
                        ],
                        body=[
                            AST.Expression("print(response.headers)  # access the response headers\n"),
                            AST.ForStatement(
                                target="chunk",
                                iterable="response.data",
                                body=[AST.Expression("print(chunk)  # access the underlying object(s)")],
                            ),
                        ],
                    )
                )

        return [self._expression_to_snippet_str(AST.Expression(AST.CodeWriter(write)))]

    def _build_retries_snippets(self) -> List[str]:
        try:
            retries_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
                feature_id=ReadmeSnippetBuilder.RETRIES_FEATURE_ID
            ) or [self._default_endpoint_id]

            retry_snippets = []
            for endpoint_id in retries_endpoint_ids:
                endpoint = self._endpoint_metadata.get_endpoint_metadata(endpoint_id)
                if endpoint is not None:
                    has_parameters = self._endpoint_metadata.has_parameters(endpoint_id)
                    retry_snippets.append(
                        f"""client.{endpoint.endpoint_package_path}{endpoint.method_name}({"..., " if has_parameters else ""}request_options={{
    "max_retries": 1
}})
"""
                    )

            return retry_snippets
        except Exception as e:
            print(f"Failed to generage retries snippets with exception {e}")
            return []

    def _build_custom_client_snippets(self) -> str:
        def _client_writer(writer: AST.NodeWriter) -> None:
            writer.write("client = ")
            writer.write_node(client_instantiation, should_write_as_snippet=False)

        try:
            client_instantiation = AST.ClassInstantiation(
                class_=self._root_client.sync_client.class_reference,
                args=[AST.Expression("...")],
                kwargs=[
                    (
                        "httpx_client",
                        AST.Expression(
                            AST.ClassInstantiation(
                                class_=HttpX.CLIENT,
                                kwargs=[
                                    ("proxy", AST.Expression('"http://my.test.proxy.example.com"')),
                                    ("transport", AST.Expression('httpx.HTTPTransport(local_address="0.0.0.0")')),
                                ],
                            )
                        ),
                    )
                ],
            )

            client_instantiation_str = self._expression_to_snippet_str(AST.Expression(AST.CodeWriter(_client_writer)))

            return client_instantiation_str
        except Exception as e:
            print(f"Failed to generage custom client snippets with exception {e}")
            return ""

    def _build_streaming_snippets(self) -> List[str]:
        try:
            return self._build_snippets_for_feature(ReadmeSnippetBuilder.STREAMING_FEATURE_ID)
        except Exception as e:
            print(f"Failed to generage streaming snippets with exception {e}")
            return []

    def _build_pagination_snippets(self) -> List[str]:
        try:
            snippets = self._build_snippets_for_feature(ReadmeSnippetBuilder.PAGINATION_FEATURE_ID)

            if len(snippets) > 0:
                pagination_endpoint_ids = self._filter_endpoint_ids_by_feature(
                    ReadmeSnippetBuilder.PAGINATION_FEATURE_ID
                )
                filtered_pagination_endpoint_ids = [
                    e for e in pagination_endpoint_ids if e in self._endpoint_snippet_map
                ]

                if len(filtered_pagination_endpoint_ids) > 0:
                    endpoint_id = filtered_pagination_endpoint_ids[0]
                    endpoint = self._endpoint_metadata.get_endpoint_metadata(endpoint_id)

                    if endpoint is not None:
                        has_parameters = self._endpoint_metadata.has_parameters(endpoint_id)

                        additional_snippet = f"""# You can also iterate through pages and access the typed response per page
pager = client.{endpoint.endpoint_package_path}{endpoint.method_name}({"..." if has_parameters else ""})
for page in pager.iter_pages():
    print(page.response)  # access the typed response for each page
    for item in page:
        print(item)
"""

                        snippets.append(additional_snippet)

            return snippets
        except Exception as e:
            print(f"Failed to generage pagination snippets with exception {e}")
            return []

    def _build_websocket_snippets(self) -> List[str]:
        websocket_snippets = []
        try:
            subpackage, websocket_channel = self._get_example_websocket_channel()
            websocket_snippets.append(
                self._get_websocket_snippet(is_async=False, subpackage=subpackage, websocket_channel=websocket_channel)
            )
            websocket_snippets.append(
                self._get_websocket_snippet(is_async=True, subpackage=subpackage, websocket_channel=websocket_channel)
            )
        except Exception as e:
            print(f"Failed to generage websocket snippets with exception {e}")
            return []
        return websocket_snippets

    def _get_websocket_snippet(
        self, is_async: bool, subpackage: ir_types.Subpackage, websocket_channel: ir_types.WebSocketChannel
    ) -> str:
        def _client_writer(writer: AST.NodeWriter) -> None:
            writer.write("client = ")
            writer.write_node(client_instantiation, should_write_as_snippet=False)

        client_instantiation = AST.ClassInstantiation(
            class_=(
                self._root_client.async_client.class_reference
                if is_async
                else self._root_client.sync_client.class_reference
            ),
            args=[AST.Expression("...")],
        )
        client_instantiation_str = self._expression_to_snippet_str(AST.Expression(AST.CodeWriter(_client_writer)))
        initial_import = "import asyncio\n\n" if is_async else "import threading\n\n"
        snippet = f"""
# Connect to the websocket ({"Async" if is_async else "Sync"})
{initial_import}{client_instantiation_str}
{"async " if is_async else ""}with client.{subpackage.name.snake_case.safe_name}.connect({"..." if websocket_channel.query_parameters else ""}) as socket:
    # Iterate over the messages as they arrive
    {"async for message in socket" if is_async else "for message in socket"}
        print(message)

    # Or, attach handlers to specific events
    socket.on(EventType.OPEN, lambda _: print("open"))
    socket.on(EventType.MESSAGE, lambda message: print("received message", message))
    socket.on(EventType.CLOSE, lambda _: print("close"))
    socket.on(EventType.ERROR, lambda error: print("error", error))

"""
        start_listen_snippet = f"""
    {"# Start listening for events in an asyncio task" if is_async else "# Start the listening loop in a background thread"}
    {"listen_task = asyncio.create_task(socket.start_listening())" if is_async else "listener_thread = threading.Thread(target=socket.start_listening, daemon=True)"}
"""
        start_listen_snippet += "" if is_async else "    listener_thread.start()\n"
        snippet += start_listen_snippet
        return snippet

    def _get_example_websocket_channel(self) -> Tuple[ir_types.Subpackage, ir_types.WebSocketChannel]:
        if self._ir.websocket_channels is None:
            raise ValueError("No websocket channels found")
        for subpackage_id in self._ir.subpackages.keys():
            subpackage = self._ir.subpackages[subpackage_id]
            if subpackage.websocket is not None and subpackage.websocket in self._ir.websocket_channels:
                return subpackage, self._ir.websocket_channels[subpackage.websocket]
        raise ValueError("No websocket channel found in any subpackage")

    def _build_async_client_snippets(self) -> List[str]:
        try:
            async_client_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
                feature_id=ReadmeSnippetBuilder.ASYNC_CLIENT_FEATURE_ID
            )
            if async_client_endpoint_ids is not None:
                return [
                    self._endpoint_snippet_map[endpoint_id].async_client for endpoint_id in async_client_endpoint_ids
                ]
            # Check if async_client exists for the default endpoint
            if self._default_endpoint_id in self._endpoint_snippet_map:
                async_client = self._endpoint_snippet_map[self._default_endpoint_id].async_client
                # Add a new line if it doesn't already end with one
                if not async_client.endswith("\n"):
                    async_client += "\n"
                return [async_client]
            return []
        except Exception as e:
            print(f"Failed to generage async client snippets with exception {e}")
            return []

    def _build_endpoint_feature_map(
        self, ir: ir_types.IntermediateRepresentation
    ) -> Dict[generatorcli.feature.FeatureId, List[ir_types.EndpointId]]:
        endpoint_feature_map: Dict[generatorcli.feature.FeatureId, List[ir_types.EndpointId]] = {
            ReadmeSnippetBuilder.PAGINATION_FEATURE_ID: [],
            ReadmeSnippetBuilder.STREAMING_FEATURE_ID: [],
            ReadmeSnippetBuilder.NO_FEATURE_PLACEHOLDER_ID: [],
        }
        for service in ir.services.values():
            for endpoint in service.endpoints:
                endpoint_response = endpoint.response
                if endpoint.pagination is not None:
                    endpoint_feature_map[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID].append(endpoint.id)
                elif (
                    endpoint_response is not None
                    and endpoint_response.body is not None
                    and endpoint_response.body.get_as_union().type == "streaming"
                ):
                    endpoint_feature_map[ReadmeSnippetBuilder.STREAMING_FEATURE_ID].append(endpoint.id)
                else:
                    endpoint_feature_map[ReadmeSnippetBuilder.NO_FEATURE_PLACEHOLDER_ID].append(endpoint.id)

        return endpoint_feature_map

    def _get_endpoints_for_feature(self, feature_id: generatorcli.feature.FeatureId) -> List[ir_types.HttpEndpoint]:
        endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(feature_id)
        return (
            self._get_endpoints(endpoint_ids)
            if endpoint_ids is not None
            else self._get_endpoints([self._default_endpoint_id])
        )

    def _get_endpoints(self, endpoint_ids: List[ir_types.EndpointId]) -> List[ir_types.HttpEndpoint]:
        return [self._endpoint_map[endpoint_id] for endpoint_id in endpoint_ids]

    def _filter_endpoint_ids_by_feature(self, feature_id: generatorcli.feature.FeatureId) -> List[ir_types.EndpointId]:
        feature_endpoint_ids = self._endpoint_feature_map[feature_id]
        return feature_endpoint_ids

    def _get_user_specified_endpoint_ids_for_feature(
        self, feature_id: generatorcli.feature.FeatureId
    ) -> Optional[List[ir_types.EndpointId]]:
        if self._ir.readme_config is None or self._ir.readme_config.features is None:
            return None

        key = self._get_feature_key(feature_id)
        if key in self._ir.readme_config.features:
            return self._ir.readme_config.features[key]

        return None

    def _get_feature_key(self, feature_id: generatorcli.feature.FeatureId) -> ir_types.FeatureId:
        return self._snake_to_camel_case(feature_id)

    def _get_default_endpoint_id(
        self,
        ir: ir_types.IntermediateRepresentation,
        snippets: generator_exec.Snippets,
    ) -> ir_types.EndpointId:
        if ir.readme_config is not None and ir.readme_config.default_endpoint is not None:
            return ir.readme_config.default_endpoint

        # TODO(tjb9dc): The below condition will never match due to non-overlapping endpoint ID types, need to fix
        # Prefer endpoints that will not be used in other feature-specific sections as the default,
        # otherwise just filter down the full list of endpoints.
        # endpoints_without_a_feature = self._endpoint_feature_map[ReadmeSnippetBuilder.NO_FEATURE_PLACEHOLDER_ID]
        # filtered_snippet_endpoints = [
        #     endpoint for endpoint in snippets.endpoints if endpoint.id not in endpoints_without_a_feature
        # ]
        # if len(filtered_snippet_endpoints) == 0:
        #     # All snippets are likely used for feature blocks, just re-use one, filtering down the original list
        #     filtered_snippet_endpoints = snippets.endpoints

        filtered_snippet_endpoints = snippets.endpoints

        # Prefer POST endpoints because they include better request structures in snippets.
        default_endpoint = next(
            (endpoint for endpoint in filtered_snippet_endpoints if endpoint.id.method == "POST"), None
        )
        if default_endpoint is None:
            if len(snippets.endpoints) == 0:
                raise ValueError("Internal error; no endpoint snippets were provided")
            default_endpoint = snippets.endpoints[0]

        if default_endpoint.id.identifier_override is None:
            raise RuntimeError("Internal error; all endpoints must define an endpoint id to generate README.md")

        return default_endpoint.id.identifier_override

    def _build_endpoints(
        self, ir: ir_types.IntermediateRepresentation
    ) -> Dict[ir_types.EndpointId, ir_types.HttpEndpoint]:
        return {endpoint.id: endpoint for service in ir.services.values() for endpoint in service.endpoints}

    def _build_endpoint_snippet_map(
        self, snippets: generator_exec.Snippets
    ) -> Dict[ir_types.EndpointId, generator_exec.PythonEndpointSnippet]:
        return {
            endpoint.id.identifier_override: self._get_python_endpoint_snippet(endpoint)
            for endpoint in snippets.endpoints
            if endpoint.id.identifier_override is not None
        }

    def _get_python_endpoint_snippet(self, endpoint: generator_exec.Endpoint) -> generator_exec.PythonEndpointSnippet:
        union = endpoint.snippet.get_as_union()
        if union.type == "python":
            return union
        raise RuntimeError(f"Internal error; expected Python snippet but got: {union.type}")

    def _snake_to_camel_case(self, s: str) -> str:
        components = s.split("_")
        return components[0].lower() + "".join(x.title() for x in components[1:])
