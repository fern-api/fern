from typing import Dict, List, Optional, Union

import fern.generator_exec.resources as generator_exec
import fern.ir.resources as ir_types
import generatorcli

class ReadmeSnippetBuilder:
    USAGE_FEATURE_ID: generatorcli.FeatureId = "USAGE"
    ASYNC_CLIENT_FEATURE_ID: generatorcli.FeatureId = "ASYNC_CLIENT"
    STREAMING_FEATURE_ID: generatorcli.FeatureId = "STREAMING"
    PAGINATION_FEATURE_ID: generatorcli.FeatureId = "PAGINATION"

    NO_FEATURE_PLACEHOLDER_ID: generatorcli.FeatureId = "NO_FEATURE"

    # TODO: Fill in the snippets for these sections, and add more as needed.
    EXCEPTION_HANDLING_FEATURE_ID: generatorcli.FeatureId = "EXCEPTION_HANDLING"
    CUSTOM_CLIENT_FEATURE_ID: generatorcli.FeatureId = "CUSTOM_CLIENT"

    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        package_name: str,
        snippets: generator_exec.Snippets,
        pagination_enabled: Union[bool, None] = False
    ):
        self._ir = ir
        self._package_name = package_name
        self._snippets = snippets
        # Pagination should really just be filtered out of the IR, this
        # is a recipe of disaster given how easy it is to forget to check these
        # flags and how many places need this context.
        self._pagination_enabled = pagination_enabled

        self._endpoint_map = self._build_endpoints(ir)
        self._endpoint_snippet_map = self._build_endpoint_snippet_map(snippets=snippets)
        self._endpoint_feature_map = self._build_endpoint_feature_map(ir)
        self._default_endpoint_id = self._get_default_endpoint_id(ir=ir, snippets=snippets)

    def build_readme_snippets(self) -> Dict[generatorcli.feature.FeatureId, List[str]]:
        snippets: Dict[generatorcli.feature.FeatureId, List[str]] = {}
        snippets[ReadmeSnippetBuilder.USAGE_FEATURE_ID] = self._build_usage_snippets()
        snippets[ReadmeSnippetBuilder.ASYNC_CLIENT_FEATURE_ID] = self._build_async_client_snippets()

        snippets[ReadmeSnippetBuilder.STREAMING_FEATURE_ID] = self._build_streaming_snippets()
        
        if self._pagination_enabled:
            snippets[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID] = self._build_pagination_snippets()

        return snippets

    def _build_usage_snippets(self) -> List[str]:
        usage_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(feature_id=ReadmeSnippetBuilder.USAGE_FEATURE_ID)
        if usage_endpoint_ids is not None:
            return [self._endpoint_snippet_map[endpoint_id].sync_client for endpoint_id in usage_endpoint_ids]
        return [self._endpoint_snippet_map[self._default_endpoint_id].sync_client]
    
    def _build_snippets_for_feature(self, feature_id: generatorcli.feature.FeatureId) -> List[str]:
        specified_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
            feature_id=feature_id
        )
        if specified_endpoint_ids is not None:
            return [self._endpoint_snippet_map[endpoint_id].sync_client for endpoint_id in specified_endpoint_ids]
        
        # If no endpoints are specified, return the an endpoint that uses the feature
        endpoints_with_feature = self._filter_endpoint_ids_by_feature(feature_id)
        if len(endpoints_with_feature) > 0:
            return [self._endpoint_snippet_map[endpoints_with_feature[0]].sync_client]
        
        return []

    def _build_streaming_snippets(self) -> List[str]:
        return self._build_snippets_for_feature(ReadmeSnippetBuilder.STREAMING_FEATURE_ID)
    
    def _build_pagination_snippets(self) -> List[str]:
        return self._build_snippets_for_feature(ReadmeSnippetBuilder.PAGINATION_FEATURE_ID)

    def _build_async_client_snippets(self) -> List[str]:
        async_client_endpoint_ids = self._get_user_specified_endpoint_ids_for_feature(
            feature_id=ReadmeSnippetBuilder.ASYNC_CLIENT_FEATURE_ID
        )
        if async_client_endpoint_ids is not None:
            return [self._endpoint_snippet_map[endpoint_id].async_client for endpoint_id in async_client_endpoint_ids]
        return [self._endpoint_snippet_map[self._default_endpoint_id].async_client]

    def _build_endpoint_feature_map(
        self,
        ir: ir_types.IntermediateRepresentation
    ) -> Dict[generatorcli.feature.FeatureId, List[ir_types.EndpointId]]:
        endpoint_feature_map: Dict[generatorcli.feature.FeatureId, List[ir_types.EndpointId]] = {
            ReadmeSnippetBuilder.PAGINATION_FEATURE_ID: [],
            ReadmeSnippetBuilder.STREAMING_FEATURE_ID: [],
            ReadmeSnippetBuilder.NO_FEATURE_PLACEHOLDER_ID: []
        }
        for service in ir.services.values():
            for endpoint in service.endpoints:
                endpoint_response = endpoint.response
                if endpoint.pagination is not None:
                    endpoint_feature_map[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID].append(endpoint.id)
                elif endpoint_response is not None and endpoint_response.body is not None and endpoint_response.body.get_as_union().type == "streaming":
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

    def _filter_endpoint_ids_by_feature(
        self, feature_id: generatorcli.feature.FeatureId
    ) -> List[ir_types.EndpointId]:
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
        return ir_types.FeatureId.from_str(self._snake_to_camel_case(feature_id))

    def _get_default_endpoint_id(
        self,
        ir: ir_types.IntermediateRepresentation,
        snippets: generator_exec.Snippets,
    ) -> ir_types.EndpointId:
        if ir.readme_config is not None and ir.readme_config.default_endpoint is not None:
            return ir.readme_config.default_endpoint
        
        # Prefer endpoints that will not be used in other feature-specific sections as the default,
        # otherwise just filter down the full list of endpoints.
        endpoints_without_a_feature = self._endpoint_feature_map[ReadmeSnippetBuilder.NO_FEATURE_PLACEHOLDER_ID]
        filtered_snippet_endpoints = [endpoint for endpoint in snippets.endpoints if endpoint.id not in endpoints_without_a_feature]
        if len(filtered_snippet_endpoints) == 0:
            # All snippets are likely used for feature blocks, just re-use one, filtering down the original list
            filtered_snippet_endpoints = snippets.endpoints

        # Prefer POST endpoints because they include better request structures in snippets.
        default_endpoint = next((endpoint for endpoint in filtered_snippet_endpoints if endpoint.id.method == "POST"), None)
        if default_endpoint is None:
            if len(snippets.endpoints) == 0:
                raise ValueError("Internal error; no endpoint snippets were provided")
            default_endpoint = snippets.endpoints[0]

        if default_endpoint.id.identifier_override is None:
            raise RuntimeError("Internal error; all endpoints must define an endpoint id to generate README.md")

        return ir_types.EndpointId.from_str(default_endpoint.id.identifier_override)

    def _build_endpoints(
        self, ir: ir_types.IntermediateRepresentation
    ) -> Dict[ir_types.EndpointId, ir_types.HttpEndpoint]:
        return {endpoint.id: endpoint for service in ir.services.values() for endpoint in service.endpoints}

    def _build_endpoint_snippet_map(
        self, snippets: generator_exec.Snippets
    ) -> Dict[ir_types.EndpointId, generator_exec.PythonEndpointSnippet]:
        return {
            ir_types.EndpointId.from_str(endpoint.id.identifier_override): self._get_python_endpoint_snippet(endpoint)
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
