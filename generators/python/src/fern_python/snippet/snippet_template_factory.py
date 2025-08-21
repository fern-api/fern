from typing import Dict, List, Optional, Tuple, Union, cast

import fdr.api.v_1.read as FdrApiV1Read
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
    UnionTemplateMember,
    UnionTemplateV2,
    VersionedSnippetTemplate,
)
from fern_python.codegen import AST
from fern_python.codegen.imports_manager import ImportsManager
from fern_python.codegen.project import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model.type_declaration_handler.enum_generator import (
    EnumSnippetGenerator,
)
from fern_python.generators.pydantic_model.type_declaration_handler.pydantic_models.pydantic_model_simple_discriminated_union_generator import (
    PydanticModelDiscriminatedUnionSnippetGenerator,
)
from fern_python.generators.pydantic_model.type_declaration_handler.typeddicts.typeddict_simple_discriminated_union_generator import (
    TypeddictDiscriminatedUnionSnippetGenerator,
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
from fern_python.snippet.template_utils import TEMPLATE_SENTINEL
from typing_extensions import assert_never

import fern.ir.resources as ir_types
from fern.generator_exec import GeneratorUpdate, LogLevel, LogUpdate


class SnippetTemplateFactory:
    CLIENT_FIXTURE_NAME = "client"
    TEST_URL_ENVVAR = "TESTS_BASE_URL"

    MAXIMUM_TEMPLATE_DEPTH = 15

    TAB_CHAR = "\t"

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
        self._use_typeddict_requests = self._context.custom_config.use_typeddict_requests

    def _get_name_value_separator(self, name: Optional[str], is_function_parameter: bool) -> str:
        if name is None:
            return ""
        return f'"{name}": ' if self._use_typeddict_requests and not is_function_parameter else f"{name}="

    # Stolen from SnippetRegistry
    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
        snippet = self._context.source_file_factory.create_snippet()
        snippet.add_expression(expr)
        # For some reason we're appending newlines to snippets, so we need to strip them for templates
        return snippet.to_str().strip()

    def _expression_to_snippet_str_and_imports(
        self,
        expr: AST.Expression,
    ) -> Tuple[str, str]:
        snippet = self._context.source_file_factory.create_snippet()
        snippet.add_expression(expr)
        snippet_full = snippet.to_str()
        snippet_without_imports = snippet.to_str(include_imports=False)

        # For some reason we're appending newlines to snippets, so we need to strip them for templates
        return snippet_full.replace(snippet_without_imports, "").strip(), snippet_without_imports.strip()

    def _generate_client(self, is_async: Optional[bool] = False) -> Template:
        if is_async:
            client = self._generated_root_client.async_client
        else:
            client = self._generated_root_client.sync_client

        # Because we don't allow for templating ALL inputs to the client, we need to separate out the template inputs
        # from the non-template inputs, and keep the non-template inputs within the snippet.
        # We could alternatively just nix the non-template inputs and only use the template inputs.
        client_template_inputs = []
        client_non_template_inputs = []
        for param in client.parameters:
            if param.template is not None:
                client_template_inputs.append(TemplateInput.factory.template(param.template))
            elif param.initializer is not None:
                client_non_template_inputs.append(param.initializer)

        # Create a new instantiation snippet as the one on the root client on self already
        # has examples inputted into it, and we need the template sentinel present for auth.
        instantiation_args = client_non_template_inputs
        if len(client_template_inputs) > 0:
            instantiation_args.append(AST.Expression(TEMPLATE_SENTINEL))
        template_client_instantiation = AST.ClassInstantiation(
            class_=client.class_reference,
            args=instantiation_args,
        )

        def _client_writer(writer: AST.NodeWriter) -> None:
            writer.write(f"{self.CLIENT_FIXTURE_NAME} = ")
            writer.write_node(template_client_instantiation)

        imports, instantiation = self._expression_to_snippet_str_and_imports(
            AST.Expression(AST.CodeWriter(_client_writer))
        )

        return Template.factory.generic(
            GenericTemplate(
                imports=[imports] if imports is not None else [],
                is_optional=True,
                template_string=instantiation,
                template_inputs=client_template_inputs,
                input_delimiter=",",
            )
        )

    def _get_subpackage_client_accessor(
        self,
        fern_filepath: ir_types.FernFilepath,
    ) -> str:
        components = fern_filepath.package_path.copy()
        if fern_filepath.file is not None:
            components += [fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.safe_name for component in components]) + "."

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
        is_function_parameter: bool,
    ) -> Template:
        template_string = f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{TEMPLATE_SENTINEL}"

        return Template.factory.generic(
            GenericTemplate(
                imports=[],
                is_optional=True,
                template_string=template_string,
                template_inputs=[
                    TemplateInput.factory.payload(
                        PayloadInput(
                            location=location,
                            path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                        )
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
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
        include_literal_templates: bool = False,
    ) -> Union[Template, None]:
        child_indentation_level = indentation_level + 1

        container_union = container.get_as_union()
        if container_union.type == "list":
            innerTr = container_union.list_
            inner_template = self.get_type_reference_template(
                type_=innerTr,
                name=None,
                location="RELATIVE",
                wire_or_original_name=None,
                name_breadcrumbs=None,
                indentation_level=child_indentation_level,
                is_function_parameter=False,
                depth=depth + 1,
            )
            return (
                Template.factory.iterable(
                    IterableTemplate(
                        imports=[],
                        is_optional=True,
                        container_template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}[\n{self.TAB_CHAR * child_indentation_level}{TEMPLATE_SENTINEL}\n{self.TAB_CHAR * indentation_level}]",
                        delimiter=f",\n{self.TAB_CHAR * child_indentation_level}",
                        inner_template=inner_template,
                        template_input=PayloadInput(
                            location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                        ),
                    )
                )
                if inner_template is not None
                else None
            )

        if container_union.type == "set":
            innerTr = container_union.set_
            inner_template = self.get_type_reference_template(
                type_=innerTr,
                name=None,
                location="RELATIVE",
                wire_or_original_name=None,
                name_breadcrumbs=None,
                indentation_level=child_indentation_level,
                is_function_parameter=False,
                depth=depth + 1,
            )
            Template.factory.iterable(
                IterableTemplate(
                    imports=[],
                    is_optional=True,
                    container_template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{{\n{self.TAB_CHAR * child_indentation_level}{TEMPLATE_SENTINEL}\n{self.TAB_CHAR * indentation_level}}}",
                    delimiter=f",\n{self.TAB_CHAR * child_indentation_level}",
                    inner_template=inner_template,
                    template_input=PayloadInput(
                        location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                    ),
                )
            ) if inner_template is not None else None

        if container_union.type == "map":
            key_template = self.get_type_reference_template(
                type_=container_union.key_type,
                name=None,
                location="RELATIVE",
                wire_or_original_name=None,
                name_breadcrumbs=None,
                indentation_level=child_indentation_level,
                is_function_parameter=False,
                depth=depth + 1,
            )
            value_template = self.get_type_reference_template(
                type_=container_union.value_type,
                name=None,
                location="RELATIVE",
                wire_or_original_name=None,
                name_breadcrumbs=None,
                indentation_level=child_indentation_level,
                is_function_parameter=False,
                depth=depth + 1,
            )
            return (
                Template.factory.dict(
                    DictTemplate(
                        imports=[],
                        is_optional=True,
                        container_template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{{\n{self.TAB_CHAR * child_indentation_level}{TEMPLATE_SENTINEL}\n{self.TAB_CHAR * indentation_level}}}",
                        delimiter=f",\n{self.TAB_CHAR * child_indentation_level}",
                        key_value_separator=": ",
                        key_template=key_template,
                        value_template=value_template,
                        template_input=PayloadInput(
                            location=location, path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs)
                        ),
                    )
                )
                if key_template is not None and value_template is not None
                else None
            )

        if container_union.type == "optional":
            value = container_union.optional
            return self.get_type_reference_template(
                type_=value,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                indentation_level=indentation_level,
                is_function_parameter=is_function_parameter,
                depth=depth,
            )

        if container_union.type == "nullable":
            value = container_union.nullable
            return self.get_type_reference_template(
                type_=value,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                indentation_level=indentation_level,
                is_function_parameter=is_function_parameter,
                depth=depth,
            )

        if include_literal_templates and container_union.type == "literal":
            literal_value = container_union.literal.visit(
                string=lambda s: f'"{s}"',
                boolean=lambda b: f"{b}",
            )
            template_string = f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{literal_value}"
            return Template.factory.generic(
                GenericTemplate(
                    is_optional=True,
                    template_string=template_string,
                    template_inputs=[
                        TemplateInput.factory.payload(
                            PayloadInput(
                                location=location,
                                path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                            )
                        )
                    ],
                )
            )

        return None

    def _convert_enum_value_to_str(
        self, type_name: ir_types.DeclaredTypeName, enum_value: ir_types.NameAndWireValue
    ) -> Tuple[str, str]:
        enum_snippet = EnumSnippetGenerator(
            snippet_writer=self._snippet_writer,
            name=type_name,
            example=enum_value,
            use_str_enums=self._context.custom_config.pydantic_config.use_str_enums,
        ).generate_snippet()
        return self._expression_to_snippet_str_and_imports(enum_snippet)

    def _get_enum_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        values: List[ir_types.EnumValue],
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
    ) -> Template:
        # TODO: we should also be making it so you can easily grab the right import depending on the enum you use
        value_map = {
            value.name.wire_value: self._convert_enum_value_to_str(type_name=type_name, enum_value=value.name)[1]
            for value in values
        }
        return Template.factory.enum(
            EnumTemplate(
                imports=[],
                is_optional=True,
                values=value_map,
                template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{TEMPLATE_SENTINEL}",
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
        depth: int,
        indentation_level: int = 0,
    ) -> Union[Template, None]:
        sut_shape = sut.shape.get_as_union()
        if self._use_typeddict_requests:
            get_template_string = lambda snippet_template_str: (
                f"{name}: {snippet_template_str}" if name is not None else f"{snippet_template_str}"
            )
            snippet_template = TypeddictDiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=None,
                example_expression=AST.Expression(TEMPLATE_SENTINEL),
                single_union_type=sut,
                union_naming_version=self._context.custom_config.pydantic_config.union_naming,
            ).generate_snippet_template()
        else:
            get_template_string = lambda snippet_template_str: (
                f"{name}={snippet_template_str}" if name is not None else f"{snippet_template_str}"
            )
            snippet_template = PydanticModelDiscriminatedUnionSnippetGenerator(
                snippet_writer=self._snippet_writer,
                name=type_name,
                example=None,
                example_expression=AST.Expression(TEMPLATE_SENTINEL),
                single_union_type=sut,
                union_naming_version=self._context.custom_config.pydantic_config.union_naming,
            ).generate_snippet_template()

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
                    indentation_level=indentation_level,
                    is_function_parameter=False,
                    depth=depth + 1,
                )
                if template_input is not None:
                    template_inputs.append(template_input)

            if snippet_template is not None:
                imports, snippet_template_str = self._expression_to_snippet_str_and_imports(snippet_template)
                return Template.factory.generic(
                    GenericTemplate(
                        imports=[imports] if imports is not None else [],
                        is_optional=True,
                        template_string=get_template_string(snippet_template_str),
                        template_inputs=template_inputs,
                    )
                )
            return None

        elif sut_shape.properties_type == "singleProperty":
            child_breadcrumbs = name_breadcrumbs or []
            if wire_or_original_name is not None:
                child_breadcrumbs.append(wire_or_original_name)

            if snippet_template is not None:
                imports, snippet_template_str = self._expression_to_snippet_str_and_imports(snippet_template)

                input = self.get_type_reference_template_input(
                    type_=sut_shape.type,
                    name=name,
                    location=location,
                    wire_or_original_name=sut_shape.name.wire_value,
                    name_breadcrumbs=child_breadcrumbs,
                    is_function_parameter=False,
                    depth=depth + 1,
                )

                return Template.factory.generic(
                    GenericTemplate(
                        imports=[imports] if imports is not None else [],
                        is_optional=True,
                        template_string=get_template_string(snippet_template_str),
                        template_inputs=[input] if input is not None else [],
                    )
                )
            return None

        elif sut_shape.properties_type == "noProperties":
            if snippet_template is not None:
                imports, snippet_template_str = self._expression_to_snippet_str_and_imports(snippet_template)

                return Template.factory.generic(
                    GenericTemplate(
                        imports=[imports] if imports is not None else [],
                        is_optional=True,
                        template_string=get_template_string(snippet_template_str),
                        template_inputs=[],
                    )
                )
            return None
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
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
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
                indentation_level=indentation_level,
                depth=depth + 1,
            )
            if member_template is not None:
                member_templates[sut.discriminant_value.wire_value] = member_template

        return Template.factory.discriminated_union(
            DiscriminatedUnionTemplate(
                imports=[],
                is_optional=True,
                discriminant_field=union_declaration.discriminant.wire_value,
                template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{TEMPLATE_SENTINEL}",
                members=member_templates,
                template_input=PayloadInput(location="RELATIVE"),
            )
        )

    def _get_object_template(
        self,
        type_name: ir_types.DeclaredTypeName,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
    ) -> Template:
        object_reference = self._snippet_writer.get_class_reference_for_declared_type_name(
            name=type_name, as_request=True
        )
        object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
            type_name=type_name.type_id
        )

        template_inputs = []
        child_indentation_level = indentation_level + 1

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
                indentation_level=child_indentation_level,
                is_function_parameter=False,
                depth=depth + 1,
            )
            if template_input is not None:
                template_inputs.append(template_input)

        object_class_name = type_name.name.pascal_case.safe_name
        if self._use_typeddict_requests:
            template_sentinel_str = f"{{\n{self.TAB_CHAR * child_indentation_level}{TEMPLATE_SENTINEL}\n{self.TAB_CHAR * indentation_level}}}"
            template_string = f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{template_sentinel_str}"
        else:
            template_sentinel_str = f"{object_class_name}(\n{self.TAB_CHAR * child_indentation_level}{TEMPLATE_SENTINEL}\n{self.TAB_CHAR * indentation_level})"
            template_string = f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{template_sentinel_str}"

        return Template.factory.generic(
            GenericTemplate(
                imports=[self._imports_manager._get_import_as_string(object_reference.import_)]
                if object_reference.import_ is not None and not self._use_typeddict_requests
                else [],
                is_optional=True,
                # TODO: move the object name getter to a function instead of the dot access below
                template_string=template_string,
                template_inputs=template_inputs,
                input_delimiter=f",\n{self.TAB_CHAR * child_indentation_level}",
            )
        )

    def _convert_ir_type_reference_to_fdr_type_reference(
        self, type_reference: ir_types.TypeReference
    ) -> FdrApiV1Read.TypeReference:
        return type_reference.visit(
            container=lambda container: container.visit(
                list_=lambda list_contents: FdrApiV1Read.TypeReference.factory.list_(
                    FdrApiV1Read.ListType(
                        item_type=self._convert_ir_type_reference_to_fdr_type_reference(list_contents)
                    )
                ),
                set_=lambda set_contents: FdrApiV1Read.TypeReference.factory.set_(
                    FdrApiV1Read.SetType(item_type=self._convert_ir_type_reference_to_fdr_type_reference(set_contents))
                ),
                map_=lambda map_contents: FdrApiV1Read.TypeReference.factory.map_(
                    FdrApiV1Read.MapType(
                        key_type=self._convert_ir_type_reference_to_fdr_type_reference(map_contents.key_type),
                        value_type=self._convert_ir_type_reference_to_fdr_type_reference(map_contents.value_type),
                    )
                ),
                optional=lambda optional_value: FdrApiV1Read.TypeReference.factory.optional(
                    FdrApiV1Read.OptionalType(
                        item_type=self._convert_ir_type_reference_to_fdr_type_reference(
                            self._unbox_type_reference(optional_value)
                        )
                    )
                ),
                nullable=lambda nullable_value: FdrApiV1Read.TypeReference.factory.optional(
                    FdrApiV1Read.OptionalType(
                        item_type=self._convert_ir_type_reference_to_fdr_type_reference(
                            self._unbox_type_reference(nullable_value)
                        )
                    )
                ),
                literal=lambda literal_value: FdrApiV1Read.TypeReference.factory.literal(
                    literal_value.visit(
                        boolean=lambda b: FdrApiV1Read.LiteralType.factory.boolean_literal(value=b),
                        string=lambda s: FdrApiV1Read.LiteralType.factory.string_literal(value=s),
                    )
                ),
            ),
            named=lambda named: FdrApiV1Read.TypeReference.factory.id(
                FdrApiV1Read.TypeReferenceId(value=named.type_id)
            ),
            primitive=lambda primitive: FdrApiV1Read.TypeReference.factory.primitive(
                primitive.v_1.visit(
                    integer=lambda: FdrApiV1Read.PrimitiveType.factory.integer(FdrApiV1Read.IntegerType()),
                    long_=lambda: FdrApiV1Read.PrimitiveType.factory.long_(FdrApiV1Read.LongType()),
                    uint=lambda: FdrApiV1Read.PrimitiveType.factory.uint(),
                    uint_64=lambda: FdrApiV1Read.PrimitiveType.factory.uint_64(),
                    float_=lambda: FdrApiV1Read.PrimitiveType.factory.double(FdrApiV1Read.DoubleType()),
                    double=lambda: FdrApiV1Read.PrimitiveType.factory.double(FdrApiV1Read.DoubleType()),
                    boolean=lambda: FdrApiV1Read.PrimitiveType.factory.boolean(FdrApiV1Read.BooleanType()),
                    string=lambda: FdrApiV1Read.PrimitiveType.factory.string(FdrApiV1Read.StringType()),
                    date=lambda: FdrApiV1Read.PrimitiveType.factory.date(FdrApiV1Read.DateType()),
                    date_time=lambda: FdrApiV1Read.PrimitiveType.factory.datetime(FdrApiV1Read.DatetimeType()),
                    uuid_=lambda: FdrApiV1Read.PrimitiveType.factory.uuid_(FdrApiV1Read.UuidType()),
                    base_64=lambda: FdrApiV1Read.PrimitiveType.factory.base_64(FdrApiV1Read.Base64Type()),
                    big_integer=lambda: FdrApiV1Read.PrimitiveType.factory.big_integer(FdrApiV1Read.BigIntegerType()),
                )
            ),
            unknown=lambda: FdrApiV1Read.TypeReference.factory.unknown(),
        )

    def _get_undiscriminated_union_template(
        self,
        union_declaration: ir_types.UndiscriminatedUnionTypeDeclaration,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
    ) -> Template:
        member_templates: List[UnionTemplateMember] = []
        for member in union_declaration.members:
            member_template = self.get_type_reference_template(
                type_=member.type,
                name=None,
                location="RELATIVE",
                wire_or_original_name=None,
                name_breadcrumbs=None,
                indentation_level=indentation_level,
                is_function_parameter=False,
                # Allow creation of literal members
                include_literal_templates=True,
                depth=depth + 1,
            )
            if member_template is not None:
                member_templates.append(
                    UnionTemplateMember(
                        type=self._convert_ir_type_reference_to_fdr_type_reference(member.type),
                        template=member_template,
                    )
                )

        return Template.factory.union_v_2(
            UnionTemplateV2(
                imports=[],
                is_optional=True,
                template_string=f"{self._get_name_value_separator(name=name, is_function_parameter=is_function_parameter)}{TEMPLATE_SENTINEL}",
                members=member_templates,
                template_input=PayloadInput(
                    location=location,
                    path=self._get_breadcrumb_path(wire_or_original_name, name_breadcrumbs),
                ),
            )
        )

    def _get_named_template(
        self,
        type_name: ir_types.NamedType,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
        include_literal_templates: bool = False,
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
                    indentation_level=indentation_level,
                    is_function_parameter=is_function_parameter,
                    include_literal_templates=include_literal_templates,
                    depth=depth,
                ),
                enum=lambda etd: self._get_enum_template(
                    type_name=cast(ir_types.DeclaredTypeName, type_name),
                    values=etd.values,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                    is_function_parameter=is_function_parameter,
                ),
                object=lambda _: self._get_object_template(
                    type_name=cast(ir_types.DeclaredTypeName, type_name),
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                    indentation_level=indentation_level,
                    is_function_parameter=is_function_parameter,
                    depth=depth,
                ),
                union=lambda utd: self._get_discriminated_union_template(
                    type_name=cast(ir_types.DeclaredTypeName, type_name),
                    union_declaration=utd,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                    indentation_level=indentation_level,
                    is_function_parameter=is_function_parameter,
                    depth=depth,
                ),
                undiscriminated_union=lambda uutd: self._get_undiscriminated_union_template(
                    union_declaration=uutd,
                    name=name,
                    location=location,
                    wire_or_original_name=wire_or_original_name,
                    name_breadcrumbs=name_breadcrumbs,
                    indentation_level=indentation_level,
                    is_function_parameter=is_function_parameter,
                    depth=depth,
                ),
            )
        return None

    def get_type_reference_template(
        self,
        type_: ir_types.TypeReference,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
        # Only used for union members
        include_literal_templates: bool = False,
    ) -> Union[Template, None]:
        # Terminate if depth is too deep
        if depth >= self.MAXIMUM_TEMPLATE_DEPTH:
            return None

        # if type is literal return None, we do not use literals as inputs
        if self._is_type_literal(type_) and not include_literal_templates:
            return None

        return type_.visit(
            primitive=lambda _: self._get_generic_template(
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                is_function_parameter=is_function_parameter,
            ),
            unknown=lambda: self._get_generic_template(
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                is_function_parameter=is_function_parameter,
            ),
            container=lambda container: self._get_container_template(
                container=container,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                indentation_level=indentation_level,
                is_function_parameter=is_function_parameter,
                include_literal_templates=include_literal_templates,
                depth=depth,
            ),
            named=lambda type_name: self._get_named_template(
                type_name=type_name,
                name=name,
                location=location,
                wire_or_original_name=wire_or_original_name,
                name_breadcrumbs=name_breadcrumbs,
                indentation_level=indentation_level,
                is_function_parameter=is_function_parameter,
                include_literal_templates=include_literal_templates,
                depth=depth,
            ),
        )

    def get_type_reference_template_input(
        self,
        type_: ir_types.TypeReference,
        name: Optional[str],
        location: PayloadLocation,
        wire_or_original_name: Optional[str],
        name_breadcrumbs: Optional[List[str]],
        is_function_parameter: bool,
        depth: int,
        indentation_level: int = 0,
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
            indentation_level=indentation_level,
            is_function_parameter=is_function_parameter,
            depth=depth,
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
            identifier_override=endpoint.id,
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
        if method is ir_types.HttpMethod.HEAD:
            return "HEAD"
        assert_never(method)

    def generate_templates(self) -> List[SnippetRegistryEntry]:
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
                        indentation_level=1,
                        is_function_parameter=True,
                        depth=0,
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
                        indentation_level=1,
                        is_function_parameter=True,
                        depth=0,
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
                        indentation_level=1,
                        is_function_parameter=True,
                        depth=0,
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
                                indentation_level=1,
                                is_function_parameter=True,
                                depth=0,
                            )
                            if parameter.raw_type is not None
                            else None
                        )
                        if ti is not None:
                            top_level_template_inputs.append(ti)

                # Create the outermost template, with the above template inputs
                async_init_expression = AST.Expression(
                    f"await {self.CLIENT_FIXTURE_NAME}.{package_path}{get_endpoint_name(endpoint)}(\n\t{TEMPLATE_SENTINEL}\n)"
                )
                async_init_string_template = self._expression_to_snippet_str(async_init_expression)
                async_function_template = Template.factory.generic(
                    GenericTemplate(
                        imports=[],
                        template_string=async_init_string_template,
                        template_inputs=top_level_template_inputs,
                        input_delimiter=",\n\t",
                        is_optional=True,
                    )
                )

                init_expression = AST.Expression(
                    f"{self.CLIENT_FIXTURE_NAME}.{package_path}{get_endpoint_name(endpoint)}(\n\t{TEMPLATE_SENTINEL}\n)"
                )
                init_string_template = self._expression_to_snippet_str(init_expression)
                function_template = Template.factory.generic(
                    GenericTemplate(
                        imports=[],
                        template_string=init_string_template,
                        template_inputs=top_level_template_inputs,
                        input_delimiter=",\n\t",
                        is_optional=True,
                    )
                )

                endpoint_id = self._endpoint_to_identifier(endpoint)
                self._generator_exec_wrapper.send_update(
                    GeneratorUpdate.factory.log(
                        LogUpdate(
                            level=LogLevel.DEBUG,
                            message=f"Snippet template created for endpoint: {endpoint_id.method} {endpoint_id.path}.",
                        )
                    )
                )

                client_instantiation = self._generate_client()
                async_client_instantiation = self._generate_client(is_async=True)
                snippet_templates.append(
                    SnippetRegistryEntry(
                        sdk=sdk,
                        endpoint_id=self._endpoint_to_identifier(endpoint),
                        snippet_template=VersionedSnippetTemplate.factory.v_1(
                            SnippetTemplate(
                                client_instantiation=client_instantiation, function_invocation=function_template
                            )
                        ),
                        additional_templates={
                            "async": VersionedSnippetTemplate.factory.v_1(
                                SnippetTemplate(
                                    client_instantiation=async_client_instantiation,
                                    function_invocation=async_function_template,
                                )
                            )
                        },
                    )
                )
        return snippet_templates

    def _unbox_type_reference(self, type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
        return type_reference.visit(
            container=lambda container: self._unbox_type_reference_container(
                type_reference=type_reference,
                container=container,
            ),
            named=lambda _: type_reference,
            primitive=lambda _: type_reference,
            unknown=lambda: type_reference,
        )

    def _unbox_type_reference_container(
        self, type_reference: ir_types.TypeReference, container: ir_types.ContainerType
    ) -> ir_types.TypeReference:
        return container.visit(
            list_=lambda _: type_reference,
            map_=lambda _: type_reference,
            set_=lambda _: type_reference,
            nullable=lambda nullable: self._unbox_type_reference(type_reference=nullable),
            optional=lambda optional: self._unbox_type_reference(type_reference=optional),
            literal=lambda _: type_reference,
        )
