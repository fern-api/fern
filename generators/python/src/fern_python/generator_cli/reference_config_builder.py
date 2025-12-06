from typing import List, Optional

import fern.generator_exec as generator_exec
import fern.ir.resources as ir_types
import generatorcli

from fern_python.codegen import AST
from fern_python.codegen.project import Project
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadata,
    EndpointMetadataCollector,
    ParameterMetadata,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


class ReferenceSectionBuilder:
    def __init__(
        self,
        *,
        package_location: str,
        description: Optional[str] = None,
        context: SdkGeneratorContext,
        project: Project,
    ):
        self.package_location = package_location
        self.description = description
        self.context = context
        self.project = project
        self.endpoints: List[generatorcli.reference.EndpointReference] = []

    def _convert_endpoint_metadata_to_title(
        self, endpoint_metadata: EndpointMetadata, has_parameters: bool
    ) -> generatorcli.reference.MethodInvocationSnippet:
        return generatorcli.reference.MethodInvocationSnippet(
            snippet_parts=[
                generatorcli.reference.LinkedText(text="client."),
                generatorcli.reference.LinkedText(text=endpoint_metadata.endpoint_package_path),
                generatorcli.reference.LinkedText(
                    text=endpoint_metadata.method_name,
                    location=generatorcli.reference.RelativeLocation(path=self.package_location),
                ),
                # Consider a compact way to list parameters here, omitting for now to not create a massively long title.
                generatorcli.reference.LinkedText(text="(...)" if has_parameters else "()"),
            ]
        )

    def _visit_type_reference(self, type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda ct: ct.visit(
                list_=lambda tr: self._visit_type_reference(tr),
                map_=lambda _: None,
                optional=lambda tr: self._visit_type_reference(tr),
                nullable=lambda tr: self._visit_type_reference(tr),
                set_=lambda tr: self._visit_type_reference(tr),
                literal=lambda _: None,
            ),
            named=lambda dtn: dtn.type_id,
            primitive=lambda _: None,
            unknown=lambda: None,
        )

    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
        snippet = self.context.source_file_factory.create_snippet()
        snippet.add_expression(expr)
        # For some reason we're appending newlines to snippets, so we need to strip them for templates
        return snippet.to_str(include_imports=False).strip()

    def _convert_type_hint_to_name(self, type_hint: AST.TypeHint) -> str:
        return self._expression_to_snippet_str(AST.Expression(type_hint))

    def _convert_type_reference_to_location(
        self, type_reference: ir_types.TypeReference, as_request: bool
    ) -> Optional[generatorcli.reference.RelativeLocation]:
        type_id = self._visit_type_reference(type_reference)
        if type_id is not None:
            path = self.project.get_relative_source_file_filepath(
                filepath=self.context.pydantic_generator_context.get_filepath_for_type_id(
                    type_id=type_id, as_request=as_request
                )
            )

            return generatorcli.reference.RelativeLocation(path=path) if path is not None else None
        return None

    def _convert_parameter(self, parameter_metadata: ParameterMetadata) -> generatorcli.reference.ParameterReference:
        return generatorcli.reference.ParameterReference(
            name=parameter_metadata.name,
            description=parameter_metadata.description,
            # location=self._convert_type_reference_to_location(parameter_metadata.type_reference, as_request=True) if parameter_metadata.type_reference is not None else None,
            type=self._convert_type_hint_to_name(parameter_metadata.type_hint)
            if parameter_metadata.type_hint is not None
            else "Any",
            required=parameter_metadata.is_required,
        )

    def add_endpoint(
        self,
        endpoint_metadata: EndpointMetadata,
        description: Optional[str],
        snippet: str,
        parameters: List[ParameterMetadata],
    ) -> None:
        converted_parameters = [self._convert_parameter(parameter) for parameter in parameters]
        # has_parameters is > 1 since we always stuff in a request_options parameter
        converted_title = self._convert_endpoint_metadata_to_title(
            endpoint_metadata=endpoint_metadata, has_parameters=len(converted_parameters) > 1
        )

        self.endpoints.append(
            generatorcli.reference.EndpointReference(
                title=converted_title, description=description, snippet=snippet, parameters=converted_parameters
            )
        )

    def build_root_reference(self) -> generatorcli.reference.RootPackageReferenceSection:
        return generatorcli.reference.RootPackageReferenceSection(
            description=self.description,
            endpoints=self.endpoints,
        )

    def build(self, *, title: str) -> generatorcli.reference.ReferenceSection:
        return generatorcli.reference.ReferenceSection(
            title=title,
            description=self.description,
            endpoints=self.endpoints,
        )


class ReferenceConfigBuilder:
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        snippets: generator_exec.Snippets,
        context: SdkGeneratorContext,
        endpoint_metadata: EndpointMetadataCollector,
        project: Project,
    ):
        self._ir = ir
        self._context = context
        self._endpoint_metadata = endpoint_metadata
        self._project = project
        self.reference_config_sections: List[generatorcli.reference.ReferenceSection] = []

        self._endpoint_snippets = {}
        for endpoint_snippet in snippets.endpoints:
            endpoint_snippet_snippet = endpoint_snippet.snippet.get_as_union()
            if endpoint_snippet_snippet.type == "python" and endpoint_snippet.id.identifier_override is not None:
                self._endpoint_snippets[endpoint_snippet.id.identifier_override] = endpoint_snippet_snippet.sync_client

    def get_root_package_location(self) -> str:
        return self._project.get_relative_source_file_filepath(
            filepath=self._context.get_filepath_for_generated_root_client()
        )

    def get_package_location(self, package_id: ir_types.SubpackageId) -> str:
        return self._project.get_relative_source_file_filepath(
            filepath=self._context.get_client_filepath_for_subpackage_service(subpackage_id=package_id)
        )

    def build_reference_section(self, service: ir_types.HttpService, package_location: str) -> ReferenceSectionBuilder:
        reference_section = ReferenceSectionBuilder(
            package_location=package_location, context=self._context, project=self._project
        )

        for endpoint in service.endpoints:
            endpoint_metadata = self._endpoint_metadata.get_endpoint_metadata(endpoint_id=endpoint.id)
            parameters = self._endpoint_metadata.get_endpoint_parameters(endpoint_id=endpoint.id)
            snippet = self._endpoint_snippets.get(endpoint.id)

            if endpoint_metadata is not None and snippet is not None:
                reference_section.add_endpoint(
                    endpoint_metadata=endpoint_metadata,
                    description=endpoint.docs,
                    snippet=snippet,
                    parameters=parameters,
                )
        return reference_section

    def generate_reference_config(self) -> generatorcli.reference.ReferenceConfig:
        root_reference_section = None
        if self._ir.root_package.service is not None:
            root_reference_section = self.build_reference_section(
                service=self._ir.services[self._ir.root_package.service],
                package_location=self.get_root_package_location(),
            ).build_root_reference()

        for subpackage_id in self._ir.subpackages.keys():
            subpackage = self._ir.subpackages[subpackage_id]
            if subpackage.service is None:
                continue

            package_service = self._ir.services[subpackage.service]
            reference_section = self.build_reference_section(
                service=package_service, package_location=self.get_package_location(subpackage_id)
            )

            fallback_name = " ".join(
                list(map(lambda part: part.pascal_case.unsafe_name, package_service.name.fern_filepath.all_parts))
            )
            self.reference_config_sections.append(
                reference_section.build(title=package_service.display_name or fallback_name)
            )

        return generatorcli.reference.ReferenceConfig(
            root_section=root_reference_section,
            sections=self.reference_config_sections,
            language="PYTHON",
        )
