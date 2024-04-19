from typing import List, Optional

import fern.generator_exec.resources as generator_exec
import fern.ir.resources as ir_types
from fern import (
    EndpointSnippetTemplate,
    PayloadInput,
    PayloadLocation,
    Sdk_Python,
    Template,
    Template_Dict,
    Template_DiscriminatedUnion,
    Template_Enum,
    Template_Generic,
    Template_Iterable,
    TemplateInput,
    TemplateSentinel,
    VersionedSnippetTemplate_V1,
)

from fern_python.codegen import AST
from fern_python.codegen.imports_manager import ImportsManager
from fern_python.codegen.project import Project, ProjectConfig
from fern_python.generators.pydantic_model.type_declaration_handler.discriminated_union.simple_discriminated_union_generator import (
    DiscriminatedUnionSnippetGenerator,
)
from fern_python.generators.pydantic_model.type_declaration_handler.enum_generator import (
    EnumSnippetGenerator,
)
from fern_python.generators.sdk.client_generator.endpoint_function_generator import (
    get_endpoint_name,
    get_parameter_name,
)
from fern_python.generators.sdk.client_generator.request_body_parameters.bytes_request_body_parameters import (
    BytesRequestBodyParameters,
)
from fern_python.generators.sdk.client_generator.request_body_parameters.file_upload_request_body_parameters import (
    FileUploadRequestBodyParameters,
)
from fern_python.generators.sdk.client_generator.request_body_parameters.inlined_request_body_parameters import (
    InlinedRequestBodyParameters,
)
from fern_python.generators.sdk.client_generator.request_body_parameters.referenced_request_body_parameters import (
    ReferencedRequestBodyParameters,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.source_file_factory.source_file_factory import SourceFileFactory


class SnippetTestFactory:
    CLIENT_FIXTURE_NAME = "client"
    TEST_URL_ENVVAR = "TESTS_BASE_URL"

    def __init__(
        self,
        project: Project,
        context: SdkGeneratorContext,
        snippet_writer: SnippetWriter,
        imports_manager: ImportsManager,
    ) -> None:
        self._project = project
        self._context = context
        self._snippet_writer = snippet_writer
        self._imports_manager = imports_manager

    # Stolen from SnippetRegistry
    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
        snippet = SourceFileFactory.create_snippet()
        snippet.add_expression(expr)
        return snippet.to_str()

    # TODO: generate a sync snippet as well, right now we're just going to start with async only
    def _generate_client(self) -> str:
        # TODO: once the FDR endpoints allow for configuring client input, accept that here
        return self._expression_to_snippet_str(self._generated_root_client.async_instantiation)

    def _get_subpackage_client_accessor(
        self,
        package: ir_types.Package,
    ) -> str:
        components = package.fern_filepath.package_path.copy()
        if package.fern_filepath.file is not None:
            components += [package.fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.unsafe_name for component in components]) + "."

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    def _get_breadcrumb_path(wire_or_original_name: Optional[str], name_breadcrumbs: Optional[List[str]]) -> str | None:
        full_name_breadcrumbs = (
            name_breadcrumbs.append(wire_or_original_name)
            if name_breadcrumbs is not None
            else [wire_or_original_name]
            if wire_or_original_name is not None
            else None
        )
        return ".".join(full_name_breadcrumbs) if full_name_breadcrumbs is not None else None

    def _get_generic_template(
        self,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        return Template_Generic(
            imports=[],
            templateString=f"{name}={TemplateSentinel}" if name is not None else f"{TemplateSentinel}",
            templateInput=[
                PayloadInput(
                    location=location,
                    path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                )
            ],
        )

    def _get_container_template(
        self,
        container: ir_types.ContainerType,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template | None:
        return container.visit(
            list=lambda innerTr: Template_Iterable(
                containerTemplateString=f"{name}=[{TemplateSentinel}]" if name is not None else f"[{TemplateSentinel}]",
                delimiter=", ",
                inner_template=self.get_type_reference_template(innerTr, None, location, None, None),
                templateInput=PayloadInput(
                    location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                ),
            ),
            set=lambda innerTr: Template_Iterable(
                containerTemplateString=f"{name}={{{TemplateSentinel}}}"
                if name is not None
                else f"{{{TemplateSentinel}}}",
                delimiter=", ",
                inner_template=self.get_type_reference_template(innerTr, None, location, None, None),
                templateInput=PayloadInput(
                    location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                ),
            ),
            map=lambda kvTr: Template_Dict(
                containerTemplateString=f"{name}={{{TemplateSentinel}}}"
                if name is not None
                else f"{{{TemplateSentinel}}}",
                delimiter=", ",
                keyValueSeparator=": ",
                keyTemplate=self.get_type_reference_template(kvTr.key_type, None, location, None, None),
                valueTemplate=self.get_type_reference_template(kvTr.value_type, None, location, None, None),
                templateInput=PayloadInput(
                    location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                ),
            ),
            optional=lambda value: self.get_type_reference_template(
                value, name, location, wire_or_original_name, name_breadcrumbs
            ),
            literal=lambda _: None,
        )

    def _convert_enum_value_to_str(
        self, type_name: ir_types.DeclaredTypeName, enum_value: ir_types.NameAndWireValue
    ) -> str:
        enum_snippet = EnumSnippetGenerator(
            snippet_writer=self._snippet_writer,
            name=type_name,
            example=enum_value,
            use_str_enums=self._context.custom_config.pydantic_config.use_str_enums,
        ).generate_snippet()
        return self._expression_to_snippet_str(enum_snippet)

    def _get_enum_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        values: List[ir_types.EnumValue],
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        value_map = {
            value.name.wire_value: self._convert_enum_value_to_str(type_name=type_name, enum_value=value)
            for value in values
        }
        return Template_Enum(
            imports=[],
            values=value_map,
            templateString=f"{name}={TemplateSentinel}" if name is not None else f"{TemplateSentinel}",
            templateInput=PayloadInput(
                location=location,
                path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
            ),
        )

    def _get_single_union_type_template(
        self,
        sut: ir_types.SingleUnionType,
        type_name: ir_types.DeclaredTypeName,
        union_declaration: ir_types.UnionTypeDeclaration,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        if sut.shape.properties_type == "samePropertiesAsObject":
            object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
                type_name=sut.shape.type_id
            )

            template_inputs = []
            for prop in object_properties:
                child_breadcrumbs = (
                    (name_breadcrumbs or []).append(wire_or_original_name)
                    if wire_or_original_name is not None
                    else name_breadcrumbs
                )
                template_input = self.get_type_reference_template_input(
                    type_=prop.value_type,
                    name=get_parameter_name(prop.name.name),
                    location=location,
                    wire_or_original_name=prop.name.wire_value,
                    name_breadcrumbs=child_breadcrumbs,
                )
                if template_input is not None:
                    template_inputs.append(template_input)

            object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
                type_id=type_name.type_id
            )
            snippet_template = DiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=AST.Expression(TemplateSentinel),
                single_union_type=sut,
            ).generate_snippet_template()
            return (
                Template_Generic(
                    imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                    if object_reference.import_ is not None
                    else [],
                    templateString=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                    if name is not None
                    else f"{TemplateSentinel}",
                    templateInputs=template_inputs,
                )
                if snippet_template is not None
                else None
            )

        elif sut.shape.properties_type == "singleProperty":
            object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
                type_id=type_name.type_id
            )
            snippet_template = DiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=AST.Expression(TemplateSentinel),
                single_union_type=sut,
            ).generate_snippet_template()
            child_breadcrumbs = (
                (name_breadcrumbs or []).append(wire_or_original_name)
                if wire_or_original_name is not None
                else name_breadcrumbs
            )

            return (
                Template_Generic(
                    imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                    if object_reference.import_ is not None
                    else [],
                    templateString=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                    if name is not None
                    else f"{TemplateSentinel}",
                    templateInputs=[
                        self.get_type_reference_template_input(
                            type_=sut.shape.type,
                            name=name,
                            location=location,
                            wire_or_original_name=sut.shape.name.wire_value,
                            name_breadcrumbs=child_breadcrumbs,
                        )
                    ],
                )
                if snippet_template is not None
                else None
            )

        elif sut.shape.properties_type == "noProperties":
            object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
                type_id=type_name.type_id
            )
            snippet_template = DiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=AST.Expression(TemplateSentinel),
                single_union_type=sut,
            ).generate_snippet_template()

            return (
                Template_Generic(
                    imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                    if object_reference.import_ is not None
                    else [],
                    templateString=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                    if name is not None
                    else f"{TemplateSentinel}",
                    templateInputs=[],
                )
                if snippet_template is not None
                else None
            )

    def _get_discriminated_union_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        union_declaration: ir_types.UnionTypeDeclaration,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        member_template_expressions = DiscriminatedUnionSnippetGenerator(
            snippet_writer=self._snippet_writer,
            name=type_name,
            example=AST.Expression(TemplateSentinel),
            union_declaration=union_declaration,
        ).generate_snippet_template()
        if member_template_expressions is not None:
            return Template_DiscriminatedUnion(
                imports=[],
                discriminant_field=union_declaration.discriminant.wire_value,
                templateString=f"{name}={TemplateSentinel}" if name is not None else f"{TemplateSentinel}",
                members={
                    sut.discriminant_value.wire_value: self._get_single_union_type_template(
                        sut=sut,
                        type_name=type_name,
                        name=name,
                        location=location,
                        wire_or_original_name=wire_or_original_name,
                        name_breadcrumbs=name_breadcrumbs,
                    )
                    for sut in union_declaration.types
                },
            )

    def _get_object_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        object_declaration: ir_types.ObjectTypeDeclaration,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
            type_id=type_name.type_id
        )
        object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
            type_name=type_name.type_id
        )

        template_inputs = []
        for prop in object_properties:
            child_breadcrumbs = (
                (name_breadcrumbs or []).append(wire_or_original_name)
                if wire_or_original_name is not None
                else name_breadcrumbs
            )
            template_input = self.get_type_reference_template_input(
                type_=prop.value_type,
                name=get_parameter_name(prop.name.name),
                location=location,
                wire_or_original_name=prop.name.wire_value,
                name_breadcrumbs=child_breadcrumbs,
            )
            if template_input is not None:
                template_inputs.append(template_input)

        return Template_Generic(
            imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
            if object_reference.import_ is not None
            else [],
            # TODO: move the object name getter to a function instead of the dot access below
            templateString=f"{name}={type_name.name.pascal_case.unsafe_name}(\n{TemplateSentinel}\n)"
            if name is not None
            else f"{type_name.name.pascal_case.unsafe_name}({TemplateSentinel})",
            templateInputs=template_inputs,
            inputDelimiter=",\n",
        )

    def _get_named_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template | None:
        type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(
            type_id=type_name.type_id
        )

        if type_declaration is not None:
            return type_declaration.shape.visit(
                alias=lambda atd: self.get_type_reference_template(
                    type_=atd.alias_of,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                ),
                enum=lambda etd: self._get_enum_template(
                    type_name=type_name,
                    values=etd.values,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                ),
                object=lambda otd: self._get_object_template(
                    type_name=type_name,
                    object_declaration=otd,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                ),
                union=lambda utd: self._get_discriminated_union_template(
                    type_name=type_name,
                    union_declaration=utd,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                ),
                undiscriminated_union=lambda _: None,
            )
        return None

    def get_type_reference_template(
        self,
        type_: ir_types.TypeReference,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template | None:
        # if type is literal return None, we do not use literals as inputs
        if self._is_type_literal(type):
            return None

        return type_.visit(
            primitive=lambda _: self._get_generic_template(
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            ),
            unknown=lambda _: self._get_generic_template(
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            ),
            container=lambda container: self._get_container_template(
                container=container,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            ),
            named=lambda type_name: self._get_named_template(
                type_name=type_name,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            ),
        )

    def get_type_reference_template_input(
        self,
        type_: ir_types.TypeReference,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> TemplateInput | None:
        # if type is literal return None, we do not use literals as inputs
        if self._is_type_literal(type):
            return None

        template = self.get_type_reference_template(
            type_=type_,
            name=name,
            location=location,
            wire_or_original_name=wire_or_original_name,
            name_breadcrumbs=name_breadcrumbs,
        )
        return self._get_template_input_from_template(template=template) if template is None else None

    def _get_template_input_from_template(self, template: Template) -> TemplateInput:
        return TemplateInput(type="template", value=template)

    # Stolen from SnippetRegistry
    def _endpoint_to_identifier(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> generator_exec.EndpointIdentifier:
        return generator_exec.EndpointIdentifier(
            path=generator_exec.EndpointPath(self._full_path_for_endpoint(endpoint)),
            method=self._ir_method_to_generator_exec_method(endpoint.method),
        )

    def _full_path_for_endpoint(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> str:
        components: List[str] = []
        head = endpoint.full_path.head.strip("/")
        if len(head) > 0:
            components.append(head)
        for part in endpoint.full_path.parts:
            components.append("{" + part.path_parameter + "}")
            tail = part.tail.strip("/")
            if len(tail) > 0:
                components.append(tail)
        return "/" + "/".join(components)

    def _ir_method_to_generator_exec_method(
        self,
        method: ir_types.HttpMethod,
    ) -> generator_exec.EndpointMethod:
        if method is ir_types.HttpMethod.GET:
            return generator_exec.EndpointMethod.GET
        if method is ir_types.HttpMethod.POST:
            return generator_exec.EndpointMethod.POST
        if method is ir_types.HttpMethod.PUT:
            return generator_exec.EndpointMethod.PUT
        if method is ir_types.HttpMethod.PATCH:
            return generator_exec.EndpointMethod.PATCH
        if method is ir_types.HttpMethod.DELETE:
            return generator_exec.EndpointMethod.DELETE
        assert_never(method)

    def templates(self, ir: ir_types.IntermediateRepresentation, project_config: ProjectConfig) -> None:
        client_instantiation = self._generate_client()
        endpoint_snippet_templates: List[EndpointSnippetTemplate] = []
        sdk = Sdk_Python(package=project_config.package_name, version=project_config.package_version)

        for service in ir.services.values():
            fern_filepath = service.name.fern_filepath
            package_path = self._get_subpackage_client_accessor(fern_filepath)

            for endpoint in service.endpoints:
                # Iterate through parameters of the endpoint
                top_level_template_inputs = []
                for header in endpoint.headers:
                    ti = self.get_type_reference_template_input(
                        type_=header.value_type,
                        name=get_parameter_name(header.name.name),
                        location="HEADERS",
                        wire_or_original_name=header.name.wire_value,
                        name_breadcrumbs=None,
                    )
                    if ti is not None:
                        top_level_template_inputs.append(ti)

                for path_parameter in endpoint.path_parameters:
                    ti = self.get_type_reference_template_input(
                        type_=path_parameter.value_type,
                        name=get_parameter_name(path_parameter.name),
                        location="PATH",
                        wire_or_original_name=path_parameter.name.original_name,
                        name_breadcrumbs=None,
                    )
                    if ti is not None:
                        top_level_template_inputs.append(ti)

                for query_parameter in endpoint.query_parameters:
                    ti = self.get_type_reference_template_input(
                        type_=query_parameter.value_type,
                        name=get_parameter_name(query_parameter.name),
                        location="QUERY",
                        wire_or_original_name=query_parameter.name.original_name,
                        name_breadcrumbs=None,
                    )
                    if ti is not None:
                        top_level_template_inputs.append(ti)

                if endpoint.request_body is not None:
                    parameters: List[AST.NamedFunctionParameter] = endpoint.request_body.visit(
                        inlined_request_body=lambda request: InlinedRequestBodyParameters(
                            context=self._context,
                            request_body=request,
                            service_name=self._service.name,
                        ).get_parameters(),
                        reference=lambda request: ReferencedRequestBodyParameters(
                            endpoint=endpoint,
                            request_body=request,
                            context=self._context,
                        ).get_parameters(),
                        file_upload=lambda request: FileUploadRequestBodyParameters(
                            endpoint=endpoint,
                            request=request,
                            context=self._context,
                        ).get_parameters(),
                        bytes=lambda request: BytesRequestBodyParameters(
                            endpoint=endpoint,
                            request=request,
                            context=self._context,
                        ).get_parameters(),
                    )

                    for parameter in parameters:
                        self.get_type_reference_template_input(
                            type_=parameter.raw_type,
                            name=parameter.name,
                            location="BODY",
                            wire_or_original_name=parameter.raw_name,
                            name_breadcrumbs=None,
                        )
                        if ti is not None:
                            top_level_template_inputs.append(ti)

                # Create the outermost template, with the above template inputs
                init_expression = AST.Expression(
                    f"await {self.CLIENT_FIXTURE_NAME}.{package_path}.{get_endpoint_name(endpoint)}(\n{TemplateSentinel}\n)"
                )
                function_template = Template_Generic(
                    imports=[],
                    templateString=init_expression,
                    templateInput=top_level_template_inputs,
                    inputDelimiter=",\n",
                    isOptional=False,
                )
                endpoint_snippet_templates.append(
                    EndpointSnippetTemplate(
                        sdk=sdk,
                        endpointId=self._endpoint_to_identifier(endpoint),
                        snippetTemplate=VersionedSnippetTemplate_V1(
                            clientInstantiation=client_instantiation, functionInvocation=function_template
                        ),
                    )
                )
