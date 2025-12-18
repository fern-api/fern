from dataclasses import dataclass
from typing import List, Optional, Tuple

from ..context.sdk_generator_context import SdkGeneratorContext
from .base_client_generator import ConstructorParameter
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction

import fern.ir.resources as ir_types

DEFAULT_EXPIRES_IN_SECONDS = 3600  # 1 hour


@dataclass
class CredentialProperty:
    field_name: str
    constructor_param_name: str
    is_literal: bool
    literal_value: Optional[str]
    is_optional: bool


class InferredAuthTokenProviderGenerator:
    CLIENT_CLASS_NAME = "InferredAuthTokenProvider"
    ASYNC_CLIENT_CLASS_NAME = "AsyncInferredAuthTokenProvider"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        inferred_auth_scheme: ir_types.InferredAuthScheme,
    ):
        self._context = context
        self._class_name = self.CLIENT_CLASS_NAME
        self._async_class_name = self.ASYNC_CLIENT_CLASS_NAME
        self._inferred_auth_scheme: ir_types.InferredAuthScheme = inferred_auth_scheme

    def generate(self, source_file: SourceFile) -> None:
        source_file.add_class_declaration(
            declaration=self._create_class_declaration(is_async=False),
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=self._create_class_declaration(is_async=True),
            should_export=False,
        )

    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        token_endpoint = self._inferred_auth_scheme.token_endpoint
        endpoint_reference = token_endpoint.endpoint
        http_endpoint = self._get_endpoint_for_reference(endpoint_reference)
        credential_properties = self._collect_credential_properties(http_endpoint)
        has_expiry = token_endpoint.expiry_property is not None

        constructor_parameters = self._get_constructor_parameters(
            credential_properties=credential_properties, is_async=is_async
        )

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        class_name = self._async_class_name if is_async else self._class_name
        class_declaration = AST.ClassDeclaration(
            name=class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_constructor_body(
                        constructor_parameters=constructor_parameters,
                        credential_properties=credential_properties,
                        has_expiry=has_expiry,
                        is_async=is_async,
                    )
                ),
            ),
        )

        class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=self._get_buffer_in_minutes_member_name(),
                initializer=AST.Expression("2"),
            ),
        )
        class_declaration.add_method(
            self._get_headers_function_declaration(has_expiry=has_expiry, is_async=is_async)
        )
        class_declaration.add_method(
            self._get_fetch_token_function_declaration(
                credential_properties=credential_properties,
                http_endpoint=http_endpoint,
                is_async=is_async,
            )
        )
        if has_expiry:
            class_declaration.add_method(self._get_expires_at_function_declaration())

        return class_declaration

    def _get_constructor_parameters(
        self, *, credential_properties: List[CredentialProperty], is_async: bool
    ) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        for prop in credential_properties:
            if not prop.is_literal:
                type_hint = AST.TypeHint.str_()
                if prop.is_optional:
                    type_hint = AST.TypeHint.optional(type_hint)
                parameters.append(
                    ConstructorParameter(
                        constructor_parameter_name=prop.constructor_param_name,
                        private_member_name=f"_{prop.field_name}",
                        type_hint=type_hint,
                        initializer=AST.Expression("None") if prop.is_optional else None,
                    )
                )

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=self._get_client_wrapper_constructor_parameter_name(),
                private_member_name=self._get_client_wrapper_member_name(),
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async)),
            )
        )

        return parameters

    def _get_write_constructor_body(
        self,
        constructor_parameters: List[ConstructorParameter],
        credential_properties: List[CredentialProperty],
        has_expiry: bool,
        *,
        is_async: bool,
    ) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            for param in constructor_parameters:
                if param.constructor_parameter_name == self._get_client_wrapper_constructor_parameter_name():
                    continue
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

            writer.write_node(
                AST.Expression(
                    AST.CodeWriter(
                        self._get_write_member_initialization(
                            member_name=self._get_cached_headers_member_name(),
                            type_hint=AST.TypeHint.optional(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())),
                            initialization=AST.Expression("None"),
                        ),
                    ),
                ),
            )

            if has_expiry:
                writer.write_node(
                    AST.Expression(
                        AST.CodeWriter(
                            self._get_write_member_initialization(
                                member_name=self._get_expires_at_member_name(),
                                type_hint=AST.TypeHint.datetime(),
                                initialization=AST.Expression(self._get_datetime_now_invocation()),
                            ),
                        ),
                    ),
                )

            token_endpoint = self._inferred_auth_scheme.token_endpoint
            endpoint_reference = token_endpoint.endpoint
            subpackage_id = endpoint_reference.subpackage_id
            if subpackage_id is not None:
                writer.write_node(
                    AST.Expression(
                        AST.CodeWriter(
                            self._get_write_auth_client_initialization(
                                subpackage_id=subpackage_id,
                                auth_client_member_name=self._get_auth_client_member_name(),
                                is_async=is_async,
                            ),
                        ),
                    ),
                )

            if is_async:
                writer.write_node(
                    AST.Expression(
                        AST.CodeWriter(
                            self._get_write_member_initialization(
                                member_name=self._get_lock_member_name(),
                                type_hint=AST.TypeHint(
                                    AST.ClassReference(
                                        qualified_name_excluding_import=(),
                                        import_=AST.ReferenceImport(
                                            module=AST.Module.built_in(("asyncio",)), named_import="Lock"
                                        ),
                                    )
                                ),
                                initialization=AST.Expression(
                                    AST.FunctionInvocation(
                                        function_definition=AST.Reference(
                                            import_=AST.ReferenceImport(module=AST.Module.built_in(("asyncio",))),
                                            qualified_name_excluding_import=("Lock",),
                                        )
                                    )
                                ),
                            ),
                        ),
                    ),
                )
            else:
                writer.write_node(
                    AST.Expression(
                        AST.CodeWriter(
                            self._get_write_member_initialization(
                                member_name=self._get_lock_member_name(),
                                type_hint=AST.TypeHint(
                                    AST.ClassReference(
                                        qualified_name_excluding_import=(),
                                        import_=AST.ReferenceImport(
                                            module=AST.Module.built_in(("threading",)), named_import="Lock"
                                        ),
                                    )
                                ),
                                initialization=AST.Expression(
                                    AST.FunctionInvocation(
                                        function_definition=AST.Reference(
                                            import_=AST.ReferenceImport(module=AST.Module.built_in(("threading",))),
                                            qualified_name_excluding_import=("Lock",),
                                        )
                                    )
                                ),
                            ),
                        ),
                    ),
                )

        return _write_constructor_body

    def _get_write_member_initialization(
        self,
        member_name: str,
        type_hint: AST.TypeHint,
        initialization: AST.Expression,
    ) -> AST.CodeWriterFunction:
        def _write_member_initialization(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(f"self.{member_name}: "))
            writer.write_node(type_hint)
            writer.write(" = ")
            writer.write_node(initialization)
            writer.write_line()

        return _write_member_initialization

    def _get_write_auth_client_initialization(
        self,
        subpackage_id: ir_types.SubpackageId,
        auth_client_member_name: str,
        *,
        is_async: bool,
    ) -> AST.CodeWriterFunction:
        def _write_auth_client_initialization(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(f"self.{auth_client_member_name} = "))
            class_reference = (
                self._context.get_reference_to_async_subpackage_service(subpackage_id)
                if is_async
                else self._context.get_reference_to_subpackage_service(subpackage_id)
            )
            writer.write_node(
                AST.ClassInstantiation(
                    class_=class_reference,
                    kwargs=[
                        (
                            "client_wrapper",
                            AST.Expression(f"{self._get_client_wrapper_constructor_parameter_name()}"),
                        ),
                    ],
                )
            )
            writer.write_line()

        return _write_auth_client_initialization

    def _get_headers_function_declaration(
        self, *, has_expiry: bool, is_async: bool
    ) -> AST.FunctionDeclaration:
        def _write_get_headers_body(writer: AST.NodeWriter) -> None:
            if has_expiry:
                writer.write(
                    f"if self.{self._get_cached_headers_member_name()} and self.{self._get_expires_at_member_name()} > "
                )
                writer.write_node(AST.Expression(self._get_datetime_now_invocation()))
            else:
                writer.write(f"if self.{self._get_cached_headers_member_name()}")
            writer.write_line(":")
            with writer.indent():
                writer.write_line(f"return self.{self._get_cached_headers_member_name()}")
            writer.write_newline_if_last_line_not()
            if is_async:
                writer.write_line(f"async with self.{self._get_lock_member_name()}:")
            else:
                writer.write_line(f"with self.{self._get_lock_member_name()}:")
            with writer.indent():
                if has_expiry:
                    writer.write(
                        f"if self.{self._get_cached_headers_member_name()} and self.{self._get_expires_at_member_name()} > "
                    )
                    writer.write_node(AST.Expression(self._get_datetime_now_invocation()))
                else:
                    writer.write(f"if self.{self._get_cached_headers_member_name()}")
                writer.write_line(":")
                with writer.indent():
                    writer.write_line(f"return self.{self._get_cached_headers_member_name()}")
                if is_async:
                    writer.write_line(f"return await self.{self._get_fetch_token_method_name()}()")
                else:
                    writer.write_line(f"return self.{self._get_fetch_token_method_name()}()")

        return AST.FunctionDeclaration(
            name=self._get_headers_method_name(),
            is_async=is_async,
            docstring=None,
            signature=AST.FunctionSignature(
                return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
            ),
            body=AST.CodeWriter(_write_get_headers_body),
        )

    def _get_fetch_token_function_declaration(
        self,
        *,
        credential_properties: List[CredentialProperty],
        http_endpoint: ir_types.HttpEndpoint,
        is_async: bool,
    ) -> AST.FunctionDeclaration:
        token_endpoint = self._inferred_auth_scheme.token_endpoint
        has_expiry = token_endpoint.expiry_property is not None

        def _write_fetch_token_body(writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write("token_response = await ")
            else:
                writer.write("token_response = ")
            writer.write_node(self._get_fetch_token_invocation(credential_properties, http_endpoint))
            writer.write_newline_if_last_line_not()

            writer.write("headers: ")
            writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()))
            writer.write_line(" = {}")

            for auth_header in token_endpoint.authenticated_request_headers:
                header_name = auth_header.header_name
                value_prefix = auth_header.value_prefix
                if value_prefix is None and header_name.lower() == "authorization":
                    value_prefix = "Bearer "

                property_accessor = self._build_response_property_accessor(
                    "token_response", auth_header.response_property
                )

                if value_prefix:
                    writer.write_line(f'headers["{header_name}"] = f"{value_prefix}{{{property_accessor}}}"')
                else:
                    writer.write_line(f'headers["{header_name}"] = {property_accessor}')

            writer.write_line(f"self.{self._get_cached_headers_member_name()} = headers")

            if has_expiry:
                expiry_property = token_endpoint.expiry_property
                if expiry_property is not None:
                    expiry_accessor = self._build_response_property_accessor("token_response", expiry_property)
                    property_type = expiry_property.property.value_type
                    property_is_optional = self._context.resolved_schema_is_optional_or_unknown(property_type)
                    writer.write(f"self.{self._get_expires_at_member_name()} = ")
                    writer.write_node(
                        node=AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                qualified_name_excluding_import=(f"self.{self._get_expires_at_method_name()}",),
                            ),
                            kwargs=[
                                (
                                    "expires_in_seconds",
                                    AST.Expression(
                                        expiry_accessor
                                        if not property_is_optional
                                        else " ".join(
                                            [
                                                expiry_accessor,
                                                "if",
                                                expiry_accessor,
                                                "is not None else",
                                                str(DEFAULT_EXPIRES_IN_SECONDS),
                                            ]
                                        )
                                    ),
                                ),
                                ("buffer_in_minutes", AST.Expression(f"self.{self._get_buffer_in_minutes_member_name()}")),
                            ],
                        ),
                    )
                    writer.write_newline_if_last_line_not()

            writer.write_line("return headers")

        return AST.FunctionDeclaration(
            name=self._get_fetch_token_method_name(),
            is_async=is_async,
            docstring=None,
            signature=AST.FunctionSignature(
                return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
            ),
            body=AST.CodeWriter(_write_fetch_token_body),
        )

    def _get_fetch_token_invocation(
        self,
        credential_properties: List[CredentialProperty],
        http_endpoint: ir_types.HttpEndpoint,
    ) -> AST.FunctionInvocation:
        kwargs = []
        for prop in credential_properties:
            if prop.is_literal:
                continue
            kwargs.append(
                (
                    prop.field_name,
                    AST.Expression(f"self._{prop.field_name}"),
                )
            )

        endpoint_name = http_endpoint.name.snake_case.safe_name

        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(
                    f"self.{self._get_auth_client_member_name()}.{endpoint_name}",
                ),
            ),
            kwargs=kwargs,
        )

    def _get_expires_at_function_declaration(self) -> AST.FunctionDeclaration:
        named_parameters = [
            AST.NamedFunctionParameter(
                name="expires_in_seconds",
                type_hint=AST.TypeHint.int_(),
            ),
            AST.NamedFunctionParameter(
                name="buffer_in_minutes",
                type_hint=AST.TypeHint.int_(),
            ),
        ]

        def _write_get_expires_at_body(writer: AST.NodeWriter) -> None:
            writer.write_line("return (")
            with writer.indent():
                writer.write_node(self._get_datetime_now_invocation())
                writer.write_line()
                writer.write("+ ")
                writer.write_node(
                    self._get_datetime_timedelta_invocation(
                        kwargs=("seconds", AST.Expression("expires_in_seconds")),
                    ),
                )
                writer.write_line()
                writer.write("- ")
                writer.write_node(
                    self._get_datetime_timedelta_invocation(
                        kwargs=("minutes", AST.Expression("buffer_in_minutes")),
                    ),
                )
            writer.write_line(")")

        return AST.FunctionDeclaration(
            name=self._get_expires_at_method_name(),
            is_async=False,
            docstring=None,
            signature=AST.FunctionSignature(
                named_parameters=named_parameters,
            ),
            body=AST.CodeWriter(_write_get_expires_at_body),
        )

    def _collect_credential_properties(self, http_endpoint: ir_types.HttpEndpoint) -> List[CredentialProperty]:
        properties: List[CredentialProperty] = []

        for header in http_endpoint.headers:
            field_name = header.name.name.snake_case.safe_name
            is_literal = self._is_literal_type(header.value_type)
            literal_value = self._extract_literal_value(header.value_type) if is_literal else None
            is_optional = self._is_optional_type(header.value_type)
            properties.append(
                CredentialProperty(
                    field_name=field_name,
                    constructor_param_name=field_name,
                    is_literal=is_literal,
                    literal_value=literal_value,
                    is_optional=is_optional,
                )
            )

        if http_endpoint.request_body is not None:
            request_body = http_endpoint.request_body.get_as_union()
            if request_body.type == "inlinedRequestBody":
                for prop in request_body.properties:
                    field_name = prop.name.name.snake_case.safe_name
                    is_literal = self._is_literal_type(prop.value_type)
                    literal_value = self._extract_literal_value(prop.value_type) if is_literal else None
                    is_optional = self._is_optional_type(prop.value_type)
                    properties.append(
                        CredentialProperty(
                            field_name=field_name,
                            constructor_param_name=field_name,
                            is_literal=is_literal,
                            literal_value=literal_value,
                            is_optional=is_optional,
                        )
                    )
            elif request_body.type == "reference":
                type_id = self._get_type_id_from_type_reference(request_body.request_body_type)
                if type_id is not None:
                    object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
                        type_id
                    )
                    for prop in object_properties:
                        field_name = prop.name.name.snake_case.safe_name
                        is_literal = self._is_literal_type(prop.value_type)
                        literal_value = self._extract_literal_value(prop.value_type) if is_literal else None
                        is_optional = self._is_optional_type(prop.value_type)
                        properties.append(
                            CredentialProperty(
                                field_name=field_name,
                                constructor_param_name=field_name,
                                is_literal=is_literal,
                                literal_value=literal_value,
                                is_optional=is_optional,
                            )
                        )

        return properties

    def _get_type_id_from_type_reference(self, type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda _: None,
            named=lambda t: self._get_type_id_from_type(t.type_id),
            primitive=lambda _: None,
            unknown=lambda: None,
        )

    def _get_type_id_from_type(self, type_id: ir_types.TypeId) -> Optional[ir_types.TypeId]:
        declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(type_id)
        return declaration.shape.visit(
            alias=lambda atd: self._get_type_id_from_type_reference(atd.alias_of),
            enum=lambda _: None,
            object=lambda o: type_id,
            undiscriminated_union=lambda _: None,
            union=lambda _: None,
        )

    def _is_literal_type(self, type_reference: ir_types.TypeReference) -> bool:
        type_union = type_reference.get_as_union()
        if type_union.type == "container":
            container = type_union.container.get_as_union()
            return container.type == "literal"
        return False

    def _extract_literal_value(self, type_reference: ir_types.TypeReference) -> Optional[str]:
        type_union = type_reference.get_as_union()
        if type_union.type == "container":
            container = type_union.container.get_as_union()
            if container.type == "literal":
                literal = container.literal.get_as_union()
                if literal.type == "string":
                    return literal.string
        return None

    def _is_optional_type(self, type_reference: ir_types.TypeReference) -> bool:
        type_union = type_reference.get_as_union()
        if type_union.type == "container":
            container = type_union.container.get_as_union()
            return container.type == "optional"
        return False

    def _build_response_property_accessor(
        self, response_var: str, response_property: ir_types.ResponseProperty
    ) -> str:
        accessor = response_var

        if response_property.property_path is not None:
            for path_element in response_property.property_path:
                property_name = path_element.name.snake_case.safe_name
                accessor = f"{accessor}.{property_name}"

        final_property_name = response_property.property.name.name.snake_case.safe_name
        accessor = f"{accessor}.{final_property_name}"

        return accessor

    def _get_endpoint_for_reference(self, endpoint_reference: ir_types.EndpointReference) -> ir_types.HttpEndpoint:
        service_id = endpoint_reference.service_id
        endpoint_id = endpoint_reference.endpoint_id
        service = self._context.ir.services.get(service_id)
        if service is None:
            raise Exception(f"Could not find service with id {service_id}")
        for endpoint in service.endpoints:
            if endpoint.id == endpoint_id:
                return endpoint
        raise Exception(f"Could not find endpoint with id {endpoint_id}")

    def _get_datetime_now_invocation(self) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                import_=AST.ReferenceImport(module=AST.Module.built_in(("datetime",)), alias="dt"),
                qualified_name_excluding_import=("datetime", "now"),
            )
        )

    def _get_datetime_timedelta_invocation(self, kwargs: Tuple[str, AST.Expression]) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                import_=AST.ReferenceImport(module=AST.Module.built_in(("datetime",)), alias="dt"),
                qualified_name_excluding_import=("timedelta",),
            ),
            kwargs=[kwargs],
        )

    def _get_client_wrapper_constructor_parameter_name(self) -> str:
        return "client_wrapper"

    def _get_client_wrapper_member_name(self) -> str:
        return "_client_wrapper"

    def _get_cached_headers_member_name(self) -> str:
        return "_cached_headers"

    def _get_expires_at_member_name(self) -> str:
        return "_expires_at"

    def _get_auth_client_member_name(self) -> str:
        return "_auth_client"

    def _get_lock_member_name(self) -> str:
        return "_lock"

    def _get_buffer_in_minutes_member_name(self) -> str:
        return "BUFFER_IN_MINUTES"

    def _get_headers_method_name(self) -> str:
        return "get_headers"

    def _get_fetch_token_method_name(self) -> str:
        return "_fetch_token"

    def _get_expires_at_method_name(self) -> str:
        return "_get_expires_at"

    def get_credential_properties(self) -> List[CredentialProperty]:
        token_endpoint = self._inferred_auth_scheme.token_endpoint
        endpoint_reference = token_endpoint.endpoint
        http_endpoint = self._get_endpoint_for_reference(endpoint_reference)
        return self._collect_credential_properties(http_endpoint)
