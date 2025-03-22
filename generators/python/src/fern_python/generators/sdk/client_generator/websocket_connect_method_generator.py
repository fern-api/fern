from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple, Union

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.codegen.ast.ast_node.node_writer import NodeWriter
from fern_python.external_dependencies import Websockets
from fern_python.generators.pydantic_model.model_utilities import can_tr_be_fern_model
from fern_python.generators.sdk.client_generator.websocket_connect_response_code_writer import (
    WebsocketConnectResponseCodeWriter,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    get_base_url,
    get_base_url_property_name,
)

from ..core_utilities.client_wrapper_generator import ClientWrapperGenerator
from .generated_root_client import GeneratedRootClient

HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveTypeV1.STRING,
        ir_types.PrimitiveTypeV1.INTEGER,
        ir_types.PrimitiveTypeV1.DOUBLE,
        ir_types.PrimitiveTypeV1.BOOLEAN,
    ]
)

ALLOWED_RESERVED_NAMES = [
    "list",
    "set",
]


@dataclass
class GeneratedConnectMethod:
    function: AST.FunctionDeclaration


class WebsocketConnectMethodGenerator:
    REQUEST_OPTIONS_VARIABLE = "request_options"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        subpackage_id: ir_types.SubpackageId,
        websocket: ir_types.WebSocketChannel,
        client_wrapper_member_name: str,
        is_async: bool,
    ):
        self._context = context
        self._package = package
        self._subpackage_id = subpackage_id
        self._websocket = websocket
        self._client_wrapper_member_name = client_wrapper_member_name
        self._is_async = is_async

        self._named_parameters_raw = self._get_websocket_named_parameters(websocket=self._websocket)

        self._path_parameter_names = dict()
        _named_parameter_names: List[str] = [param.name for param in self._named_parameters_raw]
        for path_parameter in self._websocket.path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self.deconflict_parameter_name(get_parameter_name(path_parameter.name), _named_parameter_names)
                _named_parameter_names.append(name)
                self._path_parameter_names[path_parameter.name] = name

    def generate(self) -> GeneratedConnectMethod:
        unnamed_parameters = self._get_websocket_path_parameters()
        named_parameters = self._get_overridden_parameter_types()

        function_declaration = AST.FunctionDeclaration(
            name="connect",
            is_async=self._is_async,
            docstring=self._get_docstring_for_websocket(
                websocket=self._websocket,
                named_parameters=named_parameters,
                path_parameters=self._websocket.path_parameters,
            ),
            signature=AST.FunctionSignature(
                parameters=unnamed_parameters,
                named_parameters=named_parameters,
                return_type=self._get_websocket_return_type(),
            ),
            body=(
                self._create_websocket_body_writer(
                    websocket=self._websocket,
                    is_async=self._is_async,
                    parameters=unnamed_parameters,
                    named_parameters=named_parameters,
                )
            ),
        )
        return GeneratedConnectMethod(function=function_declaration)

    def _get_overridden_parameter_types(self) -> List[AST.NamedFunctionParameter]:
        return self._named_parameters_raw

    def _get_websocket_return_type(self) -> AST.TypeHint:
        # TODO: This should be the WebsocketConnection object class.
        return AST.TypeHint.none()

    def deconflict_parameter_name(self, name: str, used_names: List[str]) -> str:
        while name in used_names:
            name += "_"
        return name

    def _get_websocket_path_parameters(self) -> List[AST.FunctionParameter]:
        parameters: List[AST.FunctionParameter] = []
        for path_parameter in self._websocket.path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self._path_parameter_names[path_parameter.name]
                parameters.append(
                    AST.FunctionParameter(
                        name=name,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            path_parameter.value_type,
                            in_endpoint=True,
                        ),
                    ),
                )
        return parameters

    def _get_websocket_named_parameters(
        self,
        *,
        websocket: ir_types.WebSocketChannel,
    ) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []

        for query_parameter in websocket.query_parameters:
            if not self._is_type_literal(type_reference=query_parameter.value_type):
                query_parameter_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    query_parameter.value_type,
                    in_endpoint=True,
                )
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(query_parameter.name.name),
                        docs=query_parameter.docs,
                        type_hint=self._get_typehint_for_query_param(query_parameter, query_parameter_type_hint),
                        initializer=self._context.pydantic_generator_context.get_initializer_for_type_reference(
                            query_parameter.value_type
                        ),
                    ),
                )

        for header in websocket.headers:
            if not self._is_header_literal(header):
                header_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    header.value_type,
                    in_endpoint=True,
                )
                if header.env is not None:
                    header_type_hint = AST.TypeHint.optional(header_type_hint)
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(header.name.name),
                        docs=header.docs,
                        type_hint=header_type_hint,
                        initializer=(
                            AST.Expression(
                                AST.FunctionInvocation(
                                    function_definition=AST.Reference(
                                        import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                        qualified_name_excluding_import=("getenv",),
                                    ),
                                    args=[AST.Expression(f'"{header.env}"')],
                                )
                            )
                            if header.env is not None
                            else None
                        ),
                    ),
                )

        parameters.sort(key=lambda x: x.type_hint is None or x.type_hint.is_optional)
        # Always include request options last.
        request_options_docs = "Request-specific configuration."

        # Check if any existing parameters have the same name as REQUEST_OPTIONS_VARIABLE
        has_request_options_parameter = False
        for param in parameters:
            if param.name == WebsocketConnectMethodGenerator.REQUEST_OPTIONS_VARIABLE:
                has_request_options_parameter = True
                break

        parameters.append(
            AST.NamedFunctionParameter(
                name=(
                    "_" + WebsocketConnectMethodGenerator.REQUEST_OPTIONS_VARIABLE
                    if has_request_options_parameter
                    else WebsocketConnectMethodGenerator.REQUEST_OPTIONS_VARIABLE
                ),
                docs=request_options_docs,
                type_hint=AST.TypeHint.optional(
                    AST.TypeHint(self._context.core_utilities.get_reference_to_request_options())
                ),
            ),
        )

        return parameters

    def _create_empty_body_writer(self) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("...")

        return AST.CodeWriter(write)

    def _create_websocket_body_writer(
        self,
        *,
        websocket: ir_types.WebSocketChannel,
        is_async: bool,
        named_parameters: List[AST.NamedFunctionParameter],
        parameters: List[AST.FunctionParameter],
    ) -> AST.CodeWriter:
        # TODO: Implement the connect method for the websocket
        def write(writer: AST.NodeWriter) -> None:
            # TODO: Implement the connect method for the websocket
            # method = endpoint.method.visit(
            #     get=lambda: "GET",
            #     post=lambda: "POST",
            #     put=lambda: "PUT",
            #     patch=lambda: "PATCH",
            #     delete=lambda: "DELETE",
            # )

            # json_request_body_var = None

            # def get_httpx_request(
            #     is_streaming: bool, response_code_writer: WebsocketConnectResponseCodeWriter
            # ) -> AST.Expression:
            #     # Get the request_options variable name from the last parameter if it exists
            #     request_options_variable_name = EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE
            #     if named_parameters and len(named_parameters) > 0:
            #         last_param = named_parameters[-1]
            #         request_options_variable_name = last_param.name

            #     return HttpX.make_request(
            #         is_streaming=is_streaming,
            #         is_async=is_async,
            #         path=(
            #             self._get_path_for_endpoint(endpoint=endpoint) if not is_endpoint_path_empty(endpoint) else None
            #         ),
            #         url=self._get_environment_as_str(endpoint=endpoint),
            #         method=method,
            #         query_parameters=self._get_query_parameters_for_endpoint(endpoint=endpoint, parent_writer=writer),
            #         request_body=json_request_body_var,
            #         content=request_body_parameters.get_content() if request_body_parameters is not None else None,
            #         files=files,
            #         response_variable_name=EndpointResponseCodeWriter.RESPONSE_VARIABLE,
            #         request_options_variable_name=request_options_variable_name,
            #         headers=self._get_headers_for_endpoint(
            #             service=service,
            #             endpoint=endpoint,
            #             idempotency_headers=idempotency_headers,
            #             parent_writer=writer,
            #         ),
            #         response_code_writer=response_code_writer.get_writer(),
            #         reference_to_client=AST.Expression(
            #             f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME}"
            #         ),
            #         is_default_body_parameter_used=self.is_default_body_parameter_used,
            #     )

            # response_code_writer = WebsocketConnectResponseCodeWriter(context=self._context)
            # is_streaming = (
            #     True
            #     if endpoint.response is not None
            #     and endpoint.response.body
            #     and (
            #         endpoint.response.body.get_as_union().type == "streaming"
            #         or endpoint.response.body.get_as_union().type == "fileDownload"
            #     )
            #     else False
            # )
            # httpx_request = get_httpx_request(is_streaming=is_streaming, response_code_writer=response_code_writer)
            # writer.write_node(httpx_request)

            writer.write_line("# TODO: Implement the connect method for the websocket")
            writer.write_line("try:")
            with writer.indent():
                if is_async:
                    writer.write_node(Websockets.async_connect(url=self._get_environment_as_str(websocket=websocket)))
                else:
                    writer.write_node(Websockets.sync_connect(url=self._get_environment_as_str(websocket=websocket)))

            response_code_writer = WebsocketConnectResponseCodeWriter(context=self._context)
            response_code_writer.write(writer)

        return AST.CodeWriter(write)

    def _get_docstring_for_websocket(
        self,
        websocket: ir_types.WebSocketChannel,
        named_parameters: List[AST.NamedFunctionParameter],
        path_parameters: List[ir_types.PathParameter],
    ) -> Optional[AST.CodeWriter]:
        if websocket.docs is None and len(named_parameters) == 0 and len(path_parameters) == 0:
            return None

        # Consolidate the named parameters and path parameters in a single list.
        parameters: List[AST.NamedFunctionParameter] = []
        parameters = self._named_parameters_from_path_parameters(path_parameters)
        parameters.extend(named_parameters)

        def write(writer: AST.NodeWriter) -> None:
            if websocket.docs is not None:
                writer.write_line(websocket.docs)
            if len(parameters) == 0:
                return
            if websocket.docs is not None:
                # Include a line between the endpoint docs and field docs.
                writer.write_line()
            if len(parameters) > 0:
                writer.write_line("Parameters")
                writer.write_line("----------")
                for i, param in enumerate(parameters):
                    if i > 0:
                        writer.write_line()
                        writer.write_line()

                    writer.write(f"{param.name} : ")
                    if param.type_hint is not None:
                        writer.write_node(param.type_hint)

                    if param.docs is not None:
                        self._write_docs(writer, param.docs)
                writer.write_line()
                writer.write_line()

            self._write_response_body_type(writer)

        return AST.CodeWriter(write)

    def _get_subpackage_client_accessor(
        self,
        package: ir_types.Package,
    ) -> str:
        components = package.fern_filepath.package_path.copy()
        if package.fern_filepath.file is not None:
            components += [package.fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.safe_name for component in components]) + "."

    def _named_parameters_have_docs(self, named_parameters: List[AST.NamedFunctionParameter]) -> bool:
        return named_parameters is not None and any(param.docs is not None for param in named_parameters)

    def _named_parameters_from_path_parameters(
        self, path_parameters: List[ir_types.PathParameter]
    ) -> List[AST.NamedFunctionParameter]:
        named_parameters: List[AST.NamedFunctionParameter] = []
        for path_parameter in path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self._path_parameter_names[path_parameter.name]
                named_parameters.append(
                    AST.NamedFunctionParameter(
                        name=name,
                        docs=path_parameter.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            path_parameter.value_type,
                            in_endpoint=True,
                        ),
                    ),
                )
        return named_parameters

    def _get_path_for_websocket(self, websocket: ir_types.WebSocketChannel) -> AST.Expression:
        head = websocket.path.head.lstrip("/")

        if len(websocket.path.parts) == 0:
            return AST.Expression(f'"{head}"')

        def write(writer: AST.NodeWriter) -> None:
            writer.write('f"')
            writer.write(head)
            for i, part in enumerate(websocket.path.parts):
                parameter_obj = websocket.path_parameters[i]
                possible_path_part_literal = self._context.get_literal_value(parameter_obj.value_type)
                if possible_path_part_literal is not None:
                    writer.write_node(AST.Expression(f"{possible_path_part_literal}"))
                else:
                    parameter = AST.Expression(
                        self._get_path_parameter_from_name(
                            websocket=websocket,
                            path_parameter_name=part.path_parameter,
                        )
                    )
                    if self._context.custom_config.pydantic_config.use_pydantic_field_aliases:
                        parameter = self.convert_and_respect_annotation_metadata_raw(
                            context=self._context,
                            object_=parameter,
                            type_reference=parameter_obj.value_type,
                        )

                    writer.write("{")
                    writer.write_node(
                        self._context.core_utilities.jsonable_encoder(
                            self.convert_and_respect_annotation_metadata_raw(
                                context=self._context,
                                object_=parameter,
                                type_reference=parameter_obj.value_type,
                            )
                        )
                    )
                    writer.write("}")
                writer.write(part.tail)
            writer.write('"')

        return AST.Expression(AST.CodeWriter(write))

    def _get_path_parameter_from_name(
        self,
        *,
        websocket: ir_types.WebSocketChannel,
        path_parameter_name: str,
    ) -> str:
        for path_parameter in websocket.path_parameters:
            if path_parameter.name == path_parameter_name:
                return self._path_parameter_names[path_parameter.name]
        raise RuntimeError("Path parameter does not exist: " + path_parameter_name)

    def _get_property_type_off_object(self) -> AST.TypeHint:
        return AST.TypeHint.any()

    def _unwrap_container_types(self, type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeReference]:
        unwrapped_type: Union[ir_types.TypeReference, None] = type_reference
        maybe_wrapped_type: Union[ir_types.TypeReference, None] = type_reference
        if maybe_wrapped_type is not None:
            union = maybe_wrapped_type.get_as_union()
            if union.type == "container":
                unwrapped_type = union.container.visit(
                    list_=lambda item_type: item_type,
                    set_=lambda item_type: item_type,
                    optional=lambda item_type: self._unwrap_container_types(item_type),
                    nullable=lambda item_type: self._unwrap_container_types(item_type),
                    map_=lambda _: None,
                    literal=lambda _: None,
                )
        return unwrapped_type

    def _write_standard_return(self, writer: NodeWriter, response_hint: AST.TypeHint, docs: Optional[str]) -> None:
        writer.write_line("Returns")
        writer.write_line("-------")
        writer.write_node(response_hint)
        if docs is not None:
            self._write_docs(writer, docs)
        writer.write_line()

    def _write_response_body_type(self, writer: NodeWriter) -> None:
        writer.write_line("Returns")
        writer.write_line("-------")
        writer.write_line(self._context.get_socket_class_name_for_subpackage_service(subpackage_id=self._subpackage_id))

    def _write_docs(self, writer: NodeWriter, docs: str) -> None:
        split = docs.split("\n")
        with writer.indent():
            for i, line in enumerate(split):
                writer.write(line)
                if i < len(split) - 1:
                    writer.write_line()

    def _get_reference_to_query_parameter(self, query_parameter: ir_types.QueryParameter) -> AST.Expression:
        parameter_name = get_parameter_name(query_parameter.name.name)
        reference = AST.Expression(parameter_name)

        if self._is_datetime(query_parameter.value_type, allow_optional=True):
            reference = self._context.core_utilities.serialize_datetime(reference)

            is_optional = not self._is_datetime(query_parameter.value_type, allow_optional=False)
            if is_optional:
                # needed to prevent infinite recursion when writing the reference to file
                existing_reference = reference

                def write_ternary(writer: AST.NodeWriter) -> None:
                    writer.write_node(existing_reference)
                    writer.write(f" if {get_parameter_name(query_parameter.name.name)} is not None else None")

                reference = AST.Expression(AST.CodeWriter(write_ternary))

        elif self._is_date(query_parameter.value_type, allow_optional=True):
            # needed to prevent infinite recursion when writing the reference to file
            existing_reference = reference

            def write_strftime(writer: AST.NodeWriter) -> None:
                writer.write("str(")
                writer.write_node(existing_reference)
                writer.write(")")

            reference = AST.Expression(AST.CodeWriter(write_strftime))

            is_optional = not self._is_date(query_parameter.value_type, allow_optional=False)
            if is_optional:
                # needed to prevent infinite recursion when writing the reference to file
                existing_reference2 = reference

                def write_ternary(writer: AST.NodeWriter) -> None:
                    writer.write_node(existing_reference2)
                    writer.write(f" if {get_parameter_name(query_parameter.name.name)} is not None else None")

                reference = AST.Expression(AST.CodeWriter(write_ternary))

        elif self._context.custom_config.pydantic_config.use_typeddict_requests and can_tr_be_fern_model(
            query_parameter.value_type, self._context.get_types()
        ):
            # We don't need any optional wrappings for the coercion here.
            unwrapped_tr = self._context.unwrap_optional_type_reference(query_parameter.value_type)
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                unwrapped_tr, in_endpoint=True, for_typeddict=True
            )
            reference = self._context.core_utilities.convert_and_respect_annotation_metadata(
                object_=reference, annotation=type_hint
            )

        return self.convert_and_respect_annotation_metadata_raw(
            context=self._context, object_=reference, type_reference=query_parameter.value_type
        )

    # Only get the environment expression if the environment is multipleBaseUrls, if it's
    # not we'll leverage the URL from the client wrapper
    def _get_environment_as_str(self, *, websocket: ir_types.WebSocketChannel) -> str:
        if self._context.ir.environments is not None:
            environments_as_union = self._context.ir.environments.environments.get_as_union()
            if environments_as_union.type == "multipleBaseUrls":
                base_url = websocket.base_url
                if base_url is None:
                    raise RuntimeError("Service is missing base_url")
                url_reference = get_base_url_property_name(
                    get_base_url(environments=environments_as_union, base_url_id=base_url)
                )
                return f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_ENVIRONMENT_METHOD_NAME}().{url_reference}"
        # TODO: DO WE WANT TO JUST RETURN AN EMPTY STRING HERE?
        return ""

    # Note if we ever somehow allow for objects in headers, we'd need to handle the alias conversion (same as with the other types, via `convert_and_respect_annotation_metadata_raw`)
    def _get_headers_for_endpoint(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
        parent_writer: AST.NodeWriter,
    ) -> Optional[AST.Expression]:
        headers: List[Tuple[str, AST.Expression]] = []

        ir_headers = service.headers + endpoint.headers
        if endpoint.idempotent:
            ir_headers += idempotency_headers

        if endpoint.request_body is not None:
            unioned_value = endpoint.request_body.get_as_union()
            if unioned_value.type == "inlinedRequestBody":
                if unioned_value.content_type is not None:
                    headers.append(("content-type", AST.Expression(f'"{unioned_value.content_type}"')))

        for header in ir_headers:
            literal_header_value = self._context.get_literal_header_value(header)
            if literal_header_value is not None and type(literal_header_value) is str:
                headers.append((header.name.wire_value, AST.Expression(f'"{literal_header_value}"')))
            elif literal_header_value is not None and type(literal_header_value) is bool:
                headers.append((header.name.wire_value, AST.Expression(f'"{str(literal_header_value).lower()}"')))
            else:
                headers.append(
                    (
                        header.name.wire_value,
                        AST.Expression(
                            f"str({get_parameter_name(header.name.name)}) if {get_parameter_name(header.name.name)} is not None else None"
                        ),
                    )
                )

        if len(headers) == 0:
            return None

        def write_headers_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for _, (header_key, header_value) in enumerate(headers):
                writer.write(f'"{header_key}": ')
                writer.write_node(header_value)
                writer.write(", ")
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write_headers_dict))

    def _get_query_parameter_reference(self, query_parameter: ir_types.QueryParameter) -> AST.Expression:
        possible_query_literal = self._context.get_literal_value(query_parameter.value_type)
        if possible_query_literal is not None and type(possible_query_literal) is str:
            return AST.Expression(f'"{possible_query_literal}"')
        elif possible_query_literal is not None and type(possible_query_literal) is bool:
            return AST.Expression(f"{possible_query_literal}")
        return self._get_reference_to_query_parameter(query_parameter)

    def _get_query_parameters_for_endpoint(
        self, *, endpoint: ir_types.HttpEndpoint, parent_writer: AST.NodeWriter
    ) -> Optional[AST.Expression]:
        query_parameters = [
            (query_parameter.name.wire_value, self._get_query_parameter_reference(query_parameter))
            for query_parameter in endpoint.query_parameters
        ]

        if len(query_parameters) == 0:
            return None

        def write_query_parameters_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for _, (query_param_key, query_param_value) in enumerate(query_parameters):
                writer.write(f'"{query_param_key}": ')
                writer.write_node(query_param_value)
                writer.write(", ")
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write_query_parameters_dict))

    def _is_datetime(
        self,
        type_reference: ir_types.TypeReference,
        *,
        allow_optional: bool,
    ) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference,
            expected=set([ir_types.PrimitiveTypeV1.DATE_TIME]),
            allow_optional=allow_optional,
            allow_enum=False,
        )

    def _is_date(
        self,
        type_reference: ir_types.TypeReference,
        *,
        allow_optional: bool,
    ) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference,
            expected=set([ir_types.PrimitiveTypeV1.DATE]),
            allow_optional=allow_optional,
            allow_enum=False,
        )

    def _is_httpx_primitive_data(self, type_reference: ir_types.TypeReference, *, allow_optional: bool) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference, expected=HTTPX_PRIMITIVE_DATA_TYPES, allow_optional=allow_optional, allow_enum=True
        )

    def _does_type_reference_match_primitives(
        self,
        type_reference: ir_types.TypeReference,
        *,
        expected: Set[ir_types.PrimitiveTypeV1],
        allow_optional: bool,
        allow_enum: bool,
    ) -> bool:
        def visit_named_type(type_name: ir_types.NamedType) -> bool:
            type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(type_name.type_id)
            return type_declaration.shape.visit(
                alias=lambda alias: self._does_type_reference_match_primitives(
                    alias.alias_of,
                    expected=expected,
                    allow_optional=allow_optional,
                    allow_enum=allow_enum,
                ),
                enum=lambda x: allow_enum,
                object=lambda x: False,
                union=lambda x: False,
                undiscriminated_union=lambda union: all(
                    self._does_type_reference_match_primitives(
                        member.type,
                        expected=expected,
                        allow_optional=allow_optional,
                        allow_enum=allow_enum,
                    )
                    for member in union.members
                ),
            )

        return type_reference.visit(
            container=lambda container: container.visit(
                list_=lambda x: False,
                set_=lambda x: False,
                optional=lambda item_type: allow_optional
                and self._does_type_reference_match_primitives(
                    item_type,
                    expected=expected,
                    allow_optional=True,
                    allow_enum=allow_enum,
                ),
                nullable=lambda item_type: allow_optional
                and self._does_type_reference_match_primitives(
                    item_type,
                    expected=expected,
                    allow_optional=True,
                    allow_enum=allow_enum,
                ),
                map_=lambda x: False,
                literal=lambda literal: literal.visit(
                    boolean=lambda x: ir_types.PrimitiveTypeV1.BOOLEAN in expected,
                    string=lambda x: ir_types.PrimitiveTypeV1.STRING in expected,
                ),
            ),
            named=visit_named_type,
            primitive=lambda primitive: primitive.v_1 in expected,
            unknown=lambda: False,
        )

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    def _is_header_literal(self, header: ir_types.HttpHeader) -> bool:
        return self._context.get_literal_header_value(header) is not None

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_typehint_for_query_param(
        self, query_parameter: ir_types.QueryParameter, query_parameter_type_hint: AST.TypeHint
    ) -> AST.TypeHint:
        value_type = query_parameter.value_type.get_as_union()
        is_optional = value_type.type == "container" and (
            value_type.container.get_as_union().type == "optional"
            or value_type.container.get_as_union().type == "nullable"
        )
        if is_optional and query_parameter.allow_multiple:
            return AST.TypeHint.optional(
                AST.TypeHint.union(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type),
                        in_endpoint=True,
                    ),
                    AST.TypeHint.sequence(
                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            unwrap_optional_type(query_parameter.value_type),
                            in_endpoint=True,
                        )
                    ),
                )
            )
        elif query_parameter.allow_multiple:
            return AST.TypeHint.union(
                query_parameter_type_hint,
                AST.TypeHint.sequence(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type),
                        in_endpoint=True,
                    )
                ),
            )
        return query_parameter_type_hint

    def convert_and_respect_annotation_metadata_raw(
        self, context: SdkGeneratorContext, object_: AST.Expression, type_reference: ir_types.TypeReference
    ) -> AST.Expression:
        if (
            self._is_datetime(type_reference, allow_optional=True)
            or self._is_date(type_reference, allow_optional=True)
            or self._is_httpx_primitive_data(type_reference, allow_optional=True)
            or not can_tr_be_fern_model(type_reference, context.get_types())
            or (
                not context.custom_config.pydantic_config.use_typeddict_requests
                and context.custom_config.pydantic_config.use_pydantic_field_aliases
            )
        ):
            return object_

        # Only bother to convert if we're using objects
        unwrapped_tr = context.unwrap_optional_type_reference(type_reference)
        type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
            unwrapped_tr, in_endpoint=True, for_typeddict=True
        )
        return context.core_utilities.convert_and_respect_annotation_metadata(object_=object_, annotation=type_hint)


def _is_request_body_optional(request_body: ir_types.HttpRequestBody) -> bool:
    union = request_body.get_as_union()
    if union.type == "reference":
        return _is_type_reference_optional(union.request_body_type)
    return False


def _is_type_reference_optional(type_reference: ir_types.TypeReference) -> bool:
    union = type_reference.get_as_union()
    if union.type == "reference":
        request_body = union.request_body_type.get_as_union()
        if request_body.type == "container":
            return (
                request_body.container.get_as_union().type == "optional"
                or request_body.container.get_as_union().type == "nullable"
            )
    return False


def get_websocket_name(endpoint: ir_types.WebSocketChannel) -> str:
    if endpoint.name.original_name.lower() in ALLOWED_RESERVED_NAMES:
        return endpoint.name.snake_case.unsafe_name
    return endpoint.name.snake_case.safe_name


def get_parameter_name(name: ir_types.Name) -> str:
    return name.snake_case.safe_name


def is_websocket_path_empty(websocket: ir_types.WebSocketChannel) -> bool:
    return len(websocket.path.head) == 0 and len(websocket.path.parts) == 0


def unwrap_optional_type(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    type_as_union = type_reference.get_as_union()
    if type_as_union.type == "container":
        container_as_union = type_as_union.container.get_as_union()
        if container_as_union.type == "optional":
            return unwrap_optional_type(container_as_union.optional)
        if container_as_union.type == "nullable":
            return unwrap_optional_type(container_as_union.nullable)
    return type_reference


def raise_bytes_response_error() -> None:
    raise NotImplementedError("Bytes response type not yet supported")
