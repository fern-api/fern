from dataclasses import dataclass
from typing import Dict, List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST


@dataclass
class ParameterMetadata:
    name: str
    type_reference: Optional[ir_types.TypeReference]
    type_hint: Optional[AST.TypeHint]
    description: Optional[str]
    is_required: bool


@dataclass
class EndpointMetadata:
    return_type: Optional[AST.TypeHint]
    # The client access path to the endpoint, not including the method name
    # for example, "client.subpackage.service" is the endpoint_package_path for
    # the endpoint "client.subpackage.service.method"
    endpoint_package_path: str
    method_name: str


class EndpointMetadataCollector:
    endpoint_parameters: Dict[ir_types.EndpointId, List[ParameterMetadata]]
    endpoint_metadata: Dict[ir_types.EndpointId, EndpointMetadata]

    def __init__(self) -> None:
        self.endpoint_parameters = {}
        self.endpoint_metadata = {}

    def has_parameters(self, endpoint_id: ir_types.EndpointId) -> bool:
        endpoint = self.get_endpoint_metadata(endpoint_id)
        return endpoint is not None and len(self.endpoint_parameters) > 1

    def register_endpoint(self, endpoint_id: ir_types.EndpointId, metadata: EndpointMetadata) -> None:
        self.endpoint_metadata[endpoint_id] = metadata

    def register_endpoint_parameter(self, endpoint_id: ir_types.EndpointId, parameter: ParameterMetadata) -> None:
        if endpoint_id not in self.endpoint_parameters:
            self.endpoint_parameters[endpoint_id] = []
        self.endpoint_parameters[endpoint_id].append(parameter)

    def get_endpoint_parameters(self, endpoint_id: ir_types.EndpointId) -> List[ParameterMetadata]:
        unique_parameters: List[ParameterMetadata] = []
        unique_parameter_names: List[str] = []

        for parameter in self.endpoint_parameters.get(endpoint_id, []):
            if parameter.name not in unique_parameter_names:
                unique_parameters.append(parameter)
                unique_parameter_names.append(parameter.name)
        return unique_parameters

    def get_endpoint_metadata(self, endpoint_id: ir_types.EndpointId) -> Optional[EndpointMetadata]:
        return self.endpoint_metadata[endpoint_id]
