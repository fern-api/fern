import json
from typing import Dict, List, Optional, Union

import fern.ir.resources as ir_types
from fdr import (
    DictTemplate,
    DiscriminatedUnionTemplate,
    EndpointIdentifier,
    EndpointMethod,
    EndpointPath,
    EnumTemplate,
    GenericTemplate,
    IterableTemplate,
    PayloadInput,
    PayloadLocation,
    PythonSdk,
    Sdk,
    SnippetRegistryEntry,
    SnippetTemplate,
    Template,
    TemplateInput,
    VersionedSnippetTemplate,
)
from fern.generator_exec.resources import GeneratorUpdate, LogLevel, LogUpdate

from fern_python.codegen import AST
from fern_python.codegen.imports_manager import ImportsManager
from fern_python.codegen.project import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
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
from fern_python.generators.sdk.client_generator.generated_root_client import (
    GeneratedRootClient,
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


class SnippetTemplateFactory:
    CLIENT_FIXTURE_NAME = "client"
    TEST_URL_ENVVAR = "TESTS_BASE_URL"
    # Write this in the fern def to share between FE + BE
    TEMPLATE_SENTINEL = "$FERN_INPUT"

    def __init__(
        self,
        project: Project,
        context: SdkGeneratorContext,
        snippet_writer: SnippetWriter,
        imports_manager: ImportsManager,
        ir: ir_types.IntermediateRepresentation,
        generated_root_client: GeneratedRootClient,
        generator_exec_wrapper: GeneratorExecWrapper,
    ) -> None:
        self._project = project
        self._context = context
        self._snippet_writer = snippet_writer
        self._imports_manager = imports_manager
        self._ir = ir
        self._generated_root_client = generated_root_client
        self._generator_exec_wrapper = generator_exec_wrapper

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
        fern_filepath: ir_types.FernFilepath,
    ) -> str:
        components = fern_filepath.package_path.copy()
        if fern_filepath.file is not None:
            components += [fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.unsafe_name for component in components]) + "."

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    def _get_breadcrumb_path(
        self, wire_or_original_name: Optional[str], name_breadcrumbs: Optional[List[str]]
    ) -> Union[str, None]:
        if wire_or_original_name is None and name_breadcrumbs is None:
            return None
        elif wire_or_original_name is not None and name_breadcrumbs is not None:
            name_breadcrumbs.append(wire_or_original_name)
        elif wire_or_original_name is not None and name_breadcrumbs is None:
            name_breadcrumbs = [wire_or_original_name]
        return ".".join(name_breadcrumbs) if name_breadcrumbs is not None else None

    def _get_generic_template(
        self,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        return Template.factory.generic(
            GenericTemplate(
                imports=[],
                is_optional=True,
                template_string=f"{name}={self.TEMPLATE_SENTINEL}" if name is not None else f"{self.TEMPLATE_SENTINEL}",
                template_inputs=[
                    PayloadInput(
                        location=location,
                        path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                    )
                ],
            )
        )

    def _get_container_template(
        self,
        container: ir_types.ContainerType,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Union[Template, None]:
        return container.visit(
            list_=lambda innerTr: Template.factory.iterable(
                IterableTemplate(
                    imports=[],
                    is_optional=True,
                    container_template_string=f"{name}=[{self.TEMPLATE_SENTINEL}]"
                    if name is not None
                    else f"[{self.TEMPLATE_SENTINEL}]",
                    delimiter=", ",
                    inner_template=self.get_type_reference_template(innerTr, None, location, None, None),
                    template_input=PayloadInput(
                        location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                    ),
                )
            ),
            set_=lambda innerTr: Template.factory.iterable(
                IterableTemplate(
                    imports=[],
                    is_optional=True,
                    container_template_string=f"{name}={{{self.TEMPLATE_SENTINEL}}}"
                    if name is not None
                    else f"{{{self.TEMPLATE_SENTINEL}}}",
                    delimiter=", ",
                    inner_template=self.get_type_reference_template(innerTr, None, location, None, None),
                    template_input=PayloadInput(
                        location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                    ),
                )
            ),
            map_=lambda kvTr: Template.factory.dict(
                DictTemplate(
                    imports=[],
                    is_optional=True,
                    container_template_string=f"{name}={{{self.TEMPLATE_SENTINEL}}}"
                    if name is not None
                    else f"{{{self.TEMPLATE_SENTINEL}}}",
                    delimiter=", ",
                    key_value_separator=": ",
                    key_template=self.get_type_reference_template(kvTr.key_type, None, location, None, None),
                    value_template=self.get_type_reference_template(kvTr.value_type, None, location, None, None),
                    template_input=PayloadInput(
                        location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                    ),
                )
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
            value.name.wire_value: self._convert_enum_value_to_str(type_name=type_name, enum_value=value.name)
            for value in values
        }
        return Template.factory.enum(
            EnumTemplate(
                imports=[],
                is_optional=True,
                values=value_map,
                template_string=f"{name}={self.TEMPLATE_SENTINEL}" if name is not None else f"{self.TEMPLATE_SENTINEL}",
                template_input=PayloadInput(
                    location=location,
                    path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                ),
            )
        )

    def _get_single_union_type_template(
        self,
        sut: ir_types.SingleUnionType,
        type_name: ir_types.DeclaredTypeName,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Union[Template, None]:
        sut_shape = sut.shape.get_as_union()
        if sut_shape.properties_type == "samePropertiesAsObject":
            object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
                type_name=sut_shape.type_id
            )

            template_inputs = []
            for prop in object_properties:
                child_breadcrumbs = name_breadcrumbs or []
                if wire_or_original_name is not None:
                    child_breadcrumbs.append(wire_or_original_name)
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
                example=None,
                example_expression=AST.Expression(self.TEMPLATE_SENTINEL),
                single_union_type=sut,
            ).generate_snippet_template()
            return (
                Template.factory.generic(
                    GenericTemplate(
                        imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                        if object_reference.import_ is not None
                        else [],
                        is_optional=True,
                        template_string=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                        if name is not None
                        else f"{self.TEMPLATE_SENTINEL}",
                        template_inputs=template_inputs,
                    )
                )
                if snippet_template is not None
                else None
            )

        elif sut_shape.properties_type == "singleProperty":
            object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
                type_id=type_name.type_id
            )
            snippet_template = DiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=None,
                example_expression=AST.Expression(self.TEMPLATE_SENTINEL),
                single_union_type=sut,
            ).generate_snippet_template()
            child_breadcrumbs = name_breadcrumbs or []
            if wire_or_original_name is not None:
                child_breadcrumbs.append(wire_or_original_name)

            return (
                Template.factory.generic(
                    GenericTemplate(
                        imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                        if object_reference.import_ is not None
                        else [],
                        is_optional=True,
                        template_string=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                        if name is not None
                        else f"{self.TEMPLATE_SENTINEL}",
                        template_inputs=[
                            self.get_type_reference_template_input(
                                type_=sut_shape.type,
                                name=name,
                                location=location,
                                wire_or_original_name=sut_shape.name.wire_value,
                                name_breadcrumbs=child_breadcrumbs,
                            )
                        ],
                    )
                )
                if snippet_template is not None
                else None
            )

        elif sut_shape.properties_type == "noProperties":
            object_reference = self._context.pydantic_generator_context.get_class_reference_for_type_id(
                type_id=type_name.type_id
            )
            snippet_template = DiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=None,
                example_expression=AST.Expression(self.TEMPLATE_SENTINEL),
                single_union_type=sut,
            ).generate_snippet_template()

            return (
                Template.factory.generic(
                    GenericTemplate(
                        imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                        if object_reference.import_ is not None
                        else [],
                        is_optional=True,
                        template_string=f"{name}={self._expression_to_snippet_str(snippet_template)}"
                        if name is not None
                        else f"{self.TEMPLATE_SENTINEL}",
                        template_inputs=[],
                    )
                )
                if snippet_template is not None
                else None
            )
        else:
            return None

    def _get_discriminated_union_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        union_declaration: ir_types.UnionTypeDeclaration,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Template:
        member_templates: Dict[str, Template] = {}
        for sut in union_declaration.types:
            member_template = self._get_single_union_type_template(
                sut=sut,
                type_name=type_name,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            )
            if member_template is not None:
                member_templates[sut.discriminant_value.wire_value] = member_template

        return Template.factory.discriminated_union(
            DiscriminatedUnionTemplate(
                imports=[],
                is_optional=True,
                discriminant_field=union_declaration.discriminant.wire_value,
                template_string=f"{name}={self.TEMPLATE_SENTINEL}" if name is not None else f"{self.TEMPLATE_SENTINEL}",
                members=member_templates,
            )
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
            child_breadcrumbs = name_breadcrumbs or []
            if wire_or_original_name is not None:
                child_breadcrumbs.append(wire_or_original_name)
            template_input = self.get_type_reference_template_input(
                type_=prop.value_type,
                name=get_parameter_name(prop.name.name),
                location=location,
                wire_or_original_name=prop.name.wire_value,
                name_breadcrumbs=child_breadcrumbs,
            )
            if template_input is not None:
                template_inputs.append(template_input)

        return Template.factory.generic(
            GenericTemplate(
                imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                if object_reference.import_ is not None
                else [],
                is_optional=True,
                # TODO: move the object name getter to a function instead of the dot access below
                template_string=f"{name}={type_name.name.pascal_case.unsafe_name}(\n{self.TEMPLATE_SENTINEL}\n)"
                if name is not None
                else f"{type_name.name.pascal_case.unsafe_name}({self.TEMPLATE_SENTINEL})",
                template_inputs=template_inputs,
                input_delimiter=",\n",
            )
        )

    def _get_named_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
    ) -> Union[Template, None]:
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
    ) -> Union[Template, None]:
        # if type is literal return None, we do not use literals as inputs
        if self._is_type_literal(type_):
            return None

        return type_.visit(
            primitive=lambda _: self._get_generic_template(
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
            ),
            unknown=lambda: self._get_generic_template(
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
    ) -> Union[TemplateInput, None]:
        # if type is literal return None, we do not use literals as inputs
        if self._is_type_literal(type_):
            return None

        template = self.get_type_reference_template(
            type_=type_,
            name=name,
            location=location,
            wire_or_original_name=wire_or_original_name,
            name_breadcrumbs=name_breadcrumbs,
        )
        return self._get_template_input_from_template(template=template) if template is not None else None

    def _get_template_input_from_template(self, template: Template) -> TemplateInput:
        return TemplateInput.factory.template(template)

    # Stolen from SnippetRegistry
    def _endpoint_to_identifier(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> EndpointIdentifier:
        return EndpointIdentifier(
            path=EndpointPath(self._full_path_for_endpoint(endpoint)),
            method=self._ir_method_to_fdr_method(endpoint.method),
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

    def _ir_method_to_fdr_method(
        self,
        method: ir_types.HttpMethod,
    ) -> EndpointMethod:
        if method is ir_types.HttpMethod.GET:
            return "GET"
        if method is ir_types.HttpMethod.POST:
            return "POST"
        if method is ir_types.HttpMethod.PUT:
            return "PUT"
        if method is ir_types.HttpMethod.PATCH:
            return "PATCH"
        if method is ir_types.HttpMethod.DELETE:
            return "DELETE"

    def generate_templates(self) -> List[SnippetRegistryEntry]:
        client_instantiation = self._generate_client()
        snippet_templates: List[SnippetRegistryEntry] = []
        if self._project._project_config is None:
            return []
        sdk = Sdk.factory.python(
            PythonSdk(
                package=self._project._project_config.package_name,
                version=self._project._project_config.package_version,
            )
        )

        for service in self._ir.services.values():
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
                        name=get_parameter_name(query_parameter.name.name),
                        location="QUERY",
                        wire_or_original_name=query_parameter.name.name.original_name,
                        name_breadcrumbs=None,
                    )
                    if ti is not None:
                        top_level_template_inputs.append(ti)

                if endpoint.request_body is not None:
                    parameters: List[AST.NamedFunctionParameter] = endpoint.request_body.visit(
                        inlined_request_body=lambda request: InlinedRequestBodyParameters(
                            context=self._context,
                            request_body=request,
                            endpoint=endpoint,
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
                        ti = (
                            self.get_type_reference_template_input(
                                type_=parameter.raw_type,
                                name=parameter.name,
                                location="BODY",
                                wire_or_original_name=parameter.raw_name,
                                name_breadcrumbs=None,
                            )
                            if parameter.raw_type is not None
                            else None
                        )
                        if ti is not None:
                            top_level_template_inputs.append(ti)

                # Create the outermost template, with the above template inputs
                init_expression = AST.Expression(
                    f"await {self.CLIENT_FIXTURE_NAME}.{package_path}{get_endpoint_name(endpoint)}(\n{self.TEMPLATE_SENTINEL}\n)"
                )
                init_string_template = self._expression_to_snippet_str(init_expression)
                function_template = Template.factory.generic(
                    GenericTemplate(
                        imports=[],
                        template_string=init_string_template,
                        template_inputs=top_level_template_inputs,
                        input_delimiter=",\n",
                        is_optional=True,
                    )
                )

                self._generator_exec_wrapper.send_update(
                    GeneratorUpdate.factory.log(
                        LogUpdate(
                            level=LogLevel.DEBUG,
                            message=f"Snippet template created for endpoint {json.dumps(self._endpoint_to_identifier(endpoint))}.",
                        )
                    )
                )
                snippet_templates.append(
                    SnippetRegistryEntry(
                        sdk=sdk,
                        endpoint_id=self._endpoint_to_identifier(endpoint),
                        snippet_template=VersionedSnippetTemplate.factory.v_1(
                            SnippetTemplate(
                                client_instantiation=client_instantiation, function_invocation=function_template
                            )
                        ),
                    )
                )
        return snippet_templates
