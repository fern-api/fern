from typing import List, Optional, Tuple

from ..context.sdk_generator_context import SdkGeneratorContext
from .base_client_generator import ConstructorParameter
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction

import fern.ir.resources as ir_types


class OAuthTokenProviderGenerator:
    CLIENT_CLASS_NAME = "OAuthTokenProvider"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        oauth_scheme: ir_types.OAuthScheme,
    ):
        self._context = context
        self._class_name = self.CLIENT_CLASS_NAME
        self._oauth_scheme: ir_types.OAuthScheme = oauth_scheme
        self._refresh_client_member_name: Optional[str] = None
        self._has_api_key: Optional[bool] = None

    def generate(self, source_file: SourceFile) -> None:
        oauth_configuration: ir_types.OAuthConfiguration = self._oauth_scheme.configuration
        oauth_configuration.visit(
            client_credentials=lambda client_credentials: source_file.add_class_declaration(
                declaration=self._create_client_credentials_class_declaration(client_credentials),
                should_export=False,
            )
        )

    def _create_client_credentials_class_declaration(
        self, client_credentials: ir_types.OAuthClientCredentials
    ) -> AST.ClassDeclaration:
        constructor_parameters = self._get_constructor_parameters(client_credentials)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        class_declaration = AST.ClassDeclaration(
            name=self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_constructor_body(
                        constructor_parameters=constructor_parameters,
                        private_member_initialization_exprs=self._get_private_member_initialization_exprs(
                            client_credentials=client_credentials
                        ),
                    )
                ),
            ),
        )

        # TODO: Make the BUFFER_IN_MINUTES constant configurable.
        class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=self._get_buffer_in_minutes_member_name(),
                initializer=AST.Expression("2"),
            ),
        )
        class_declaration.add_method(self._get_token_function_declaration(client_credentials=client_credentials))
        class_declaration.add_method(self._get_refresh_function_declaration(client_credentials=client_credentials))
        if self._has_expires_in_property(client_credentials):
            class_declaration.add_method(self._get_expires_at_function_declaration())

        return class_declaration

    def _get_constructor_parameters(self, client_credentials: ir_types.OAuthClientCredentials) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        endpoint_to_check = (
            self._get_endpoint_for_id(client_credentials.refresh_endpoint.endpoint_reference.endpoint_id)
            if client_credentials.refresh_endpoint is not None
            else self._get_endpoint_for_id(client_credentials.token_endpoint.endpoint_reference.endpoint_id)
        )
        
        has_api_key = self._endpoint_has_api_key_parameter(endpoint_to_check)
        self._has_api_key = has_api_key
        
        if has_api_key:
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=self._get_api_key_constructor_parameter_name(),
                    private_member_name=self._get_api_key_member_name(),
                    type_hint=AST.TypeHint.str_(),
                )
            )

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=self._get_client_id_constructor_parameter_name(),
                private_member_name=self._get_client_id_member_name(),
                type_hint=AST.TypeHint.str_(),
            )
        )

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=self._get_client_secret_constructor_parameter_name(),
                private_member_name=self._get_client_secret_member_name(),
                type_hint=AST.TypeHint.str_(),
            )
        )

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=self._get_client_wrapper_constructor_parameter_name(),
                private_member_name=self._get_client_wrapper_member_name(),
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=False)),
            )
        )

        return parameters

    def _get_write_constructor_body(
        self,
        constructor_parameters: List[ConstructorParameter],
        private_member_initialization_exprs: List[AST.Expression],
    ) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            for param in constructor_parameters:
                if param.constructor_parameter_name == self._get_client_wrapper_constructor_parameter_name():
                    continue
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

            for expr in private_member_initialization_exprs:
                writer.write_node(expr)

        return _write_constructor_body

    def _get_private_member_initialization_exprs(
        self, client_credentials: ir_types.OAuthClientCredentials
    ) -> List[AST.Expression]:
        """
        Generates the initialization of the private member variables, including the clients for the token and refresh endpoints.
        In most cases this is only a single client.

        self._access_token: Optional[str] = None
        self._refresh_token: Optional[str] = None
        self._expires_at: dt.datetime = dt.datetime.now()
        self._auth_client = AuthClient(client_wrapper=client_wrapper)
        self._refresh_client = RefreshClient(client_wrapper=client_wrapper)
        """
        result: List[AST.Expression] = []

        result.append(
            AST.Expression(
                AST.CodeWriter(
                    self._get_write_member_initialization(
                        member_name=self._get_access_token_member_name(),
                        type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                        initialization=AST.Expression("None"),
                    ),
                ),
            ),
        )

        if client_credentials.token_endpoint.response_properties.expires_in is not None or (
            client_credentials.refresh_endpoint is not None
            and client_credentials.refresh_endpoint.response_properties.expires_in is not None
        ):
            result.append(
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

        if client_credentials.token_endpoint.response_properties.refresh_token is not None or (
            client_credentials.refresh_endpoint is not None
            and client_credentials.refresh_endpoint.response_properties.refresh_token is not None
        ):
            result.append(
                AST.Expression(
                    AST.CodeWriter(
                        self._get_write_member_initialization(
                            member_name=self._get_refresh_token_member_name(),
                            type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                            initialization=AST.Expression("None"),
                        ),
                    ),
                ),
            )

        token_subpackage_id = self._get_subpackage_id_for_endpoint_id(
            endpoint_id=client_credentials.token_endpoint.endpoint_reference.endpoint_id,
        )

        result.append(
            AST.Expression(
                AST.CodeWriter(
                    self._get_write_auth_client_initialization(
                        subpackage_id=token_subpackage_id,
                        auth_client_member_name=self._get_auth_client_member_name(),
                    ),
                ),
            ),
        )

        refresh_subpackage_id = (
            self._get_subpackage_id_for_endpoint_id(
                endpoint_id=client_credentials.refresh_endpoint.endpoint_reference.endpoint_id
            )
            if client_credentials.refresh_endpoint is not None
            else None
        )

        if refresh_subpackage_id is not None and refresh_subpackage_id != token_subpackage_id:
            self._set_refresh_client_member_name()
            result.append(
                AST.Expression(
                    AST.CodeWriter(
                        self._get_write_auth_client_initialization(
                            subpackage_id=refresh_subpackage_id,
                            auth_client_member_name=self._get_refresh_client_member_name(),
                        ),
                    ),
                ),
            )

        return result

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

    def _has_expires_in_property(self, client_credentials: ir_types.OAuthClientCredentials) -> bool:
        return client_credentials.token_endpoint.response_properties.expires_in is not None or (
            client_credentials.refresh_endpoint is not None
            and client_credentials.refresh_endpoint.response_properties.expires_in is not None
        )

    def _get_write_auth_client_initialization(
        self,
        subpackage_id: ir_types.SubpackageId,
        auth_client_member_name: str,
    ) -> AST.CodeWriterFunction:
        def _write_auth_client_initialization(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(f"self.{auth_client_member_name} = "))
            writer.write_node(
                AST.ClassInstantiation(
                    class_=self._context.get_reference_to_subpackage_service(subpackage_id),
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

    def _get_token_function_declaration(
        self, client_credentials: ir_types.OAuthClientCredentials
    ) -> AST.FunctionDeclaration:
        def _write_get_token_body(writer: AST.NodeWriter) -> None:
            if self._has_expires_in_property(client_credentials):
                writer.write(
                    f"if self.{self._get_access_token_member_name()} and self.{self._get_expires_at_member_name()} > "
                )
                writer.write_node(AST.Expression(self._get_datetime_now_invocation()))
            else:
                writer.write(f"if self.{self._get_access_token_member_name()}")
            writer.write_line(":")
            with writer.indent():
                writer.write_line(f"return self.{self._get_access_token_member_name()}")
            writer.write_line(f"return self.{self._get_refresh_token_method_name()}()")

        return AST.FunctionDeclaration(
            name=self._get_token_method_name(),
            is_async=False,
            docstring=None,
            signature=AST.FunctionSignature(
                return_type=AST.TypeHint.str_(),
            ),
            body=AST.CodeWriter(_write_get_token_body),
        )

    def _get_refresh_function_declaration(
        self, client_credentials: ir_types.OAuthClientCredentials
    ) -> AST.FunctionDeclaration:
        def _write_refresh_body(writer: AST.NodeWriter) -> None:
            # TODO: Add better support for the refresh token endpoint.
            writer.write("token_response = ")
            writer.write_node(self._get_refresh_function_invocation(client_credentials))
            writer.write_newline_if_last_line_not()

            response_properties = (
                client_credentials.refresh_endpoint.response_properties
                if client_credentials.refresh_endpoint is not None
                else client_credentials.token_endpoint.response_properties
            )
            writer.write_node(
                AST.CodeWriter(
                    self._get_write_response_property_setter(
                        response_property=response_properties.access_token,
                        member_name=self._get_access_token_member_name(),
                    ),
                ),
            )

            refresh_token_property = response_properties.refresh_token
            if refresh_token_property is not None:
                writer.write_node(
                    AST.CodeWriter(
                        self._get_write_response_property_setter(
                            response_property=refresh_token_property,
                            member_name=self._get_refresh_token_member_name(),
                        ),
                    ),
                )

            expires_in_property = response_properties.expires_in
            if expires_in_property is not None:
                writer.write_node(
                    AST.CodeWriter(
                        self._get_write_expires_at_setter(
                            expires_in_property=expires_in_property,
                            member_name=self._get_expires_at_member_name(),
                        ),
                    ),
                )

            writer.write_newline_if_last_line_not()
            writer.write_line(f"return self.{self._get_access_token_member_name()}")

        return AST.FunctionDeclaration(
            name=self._get_refresh_token_method_name(),
            is_async=False,
            docstring=None,
            signature=AST.FunctionSignature(
                return_type=AST.TypeHint.str_(),
            ),
            body=AST.CodeWriter(_write_refresh_body),
        )

    def _get_write_response_property_setter(
        self,
        response_property: ir_types.ResponseProperty,
        member_name: str,
    ) -> AST.CodeWriterFunction:
        def _write_response_property_setter(writer: AST.NodeWriter) -> None:
            property_path = response_property.property_path
            property_name = response_property.property.name.name.snake_case.safe_name
            # Extract names from PropertyPathItem objects
            property_path_names = [item.name for item in property_path] if property_path else None
            writer.write_line(
                f"self.{member_name} = token_response.{self._get_response_property_path(property_path_names)}{property_name}"
            )

        return _write_response_property_setter

    def _get_write_expires_at_setter(
        self,
        expires_in_property: ir_types.ResponseProperty,
        member_name: str,
    ) -> AST.CodeWriterFunction:
        def _write_expires_at_setter(writer: AST.NodeWriter) -> None:
            property_path = expires_in_property.property_path
            property_name = expires_in_property.property.name.name.snake_case.safe_name
            # Extract names from PropertyPathItem objects
            property_path_names = [item.name for item in property_path] if property_path else None
            writer.write(f"self.{member_name} = ")
            writer.write_node(
                node=AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        qualified_name_excluding_import=(f"self.{self._get_expires_at_method_name()}",),
                    ),
                    kwargs=[
                        (
                            "expires_in_seconds",
                            AST.Expression(
                                f"token_response.{self._get_response_property_path(property_path_names)}{property_name}"
                            ),
                        ),
                        ("buffer_in_minutes", AST.Expression(f"self.{self._get_buffer_in_minutes_member_name()}")),
                    ],
                ),
            )

        return _write_expires_at_setter

    def _get_response_property_path(self, property_path: Optional[List[ir_types.Name]]) -> str:
        if property_path is None or len(property_path) == 0:
            return ""
        return ".".join([name.snake_case.safe_name for name in property_path]) + "."

    def _get_refresh_function_invocation(
        self, client_credentials: ir_types.OAuthClientCredentials
    ) -> AST.FunctionInvocation:
        # TODO(amckinney): Support non-in-lined request types.
        endpoint_to_check = (
            self._get_endpoint_for_id(client_credentials.refresh_endpoint.endpoint_reference.endpoint_id)
            if client_credentials.refresh_endpoint is not None
            else self._get_endpoint_for_id(client_credentials.token_endpoint.endpoint_reference.endpoint_id)
        )
        
        has_api_key = self._endpoint_has_api_key_parameter(endpoint_to_check)
        
        kwargs = []
        if has_api_key:
            kwargs.append(
                (
                    "api_key",
                    AST.Expression(f"self.{self._get_api_key_member_name()}"),
                )
            )
        
        kwargs.extend([
            (
                "client_id",
                AST.Expression(f"self.{self._get_client_id_member_name()}"),
            ),
            (
                "client_secret",
                AST.Expression(f"self.{self._get_client_secret_member_name()}"),
            ),
        ])
        
        if client_credentials.refresh_endpoint is None:
            token_endpoint: ir_types.HttpEndpoint = self._get_endpoint_for_id(
                client_credentials.token_endpoint.endpoint_reference.endpoint_id
            )
            return AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(
                        f"self.{self._get_auth_client_member_name()}.{token_endpoint.name.snake_case.safe_name}",
                    ),
                ),
                kwargs=kwargs,
            )

        refresh_token_endpoint: ir_types.HttpEndpoint = self._get_endpoint_for_id(
            client_credentials.refresh_endpoint.endpoint_reference.endpoint_id
        )
        kwargs.append(
            (
                "refresh_token",
                AST.Expression(f"self.{self._get_refresh_token_member_name()}"),
            ),
        )
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(
                    f"self.{self._get_refresh_client_member_name()}.{refresh_token_endpoint.name.snake_case.safe_name}",
                ),
            ),
            kwargs=kwargs,
        )

    def _get_expires_at_function_declaration(self) -> AST.FunctionDeclaration:
        """
        def _get_expires_at(expires_in_seconds: int, buffer_in_minutes: int):
            return (
                dt.datetime.now()
                + dt.timedelta(seconds=expires_in_seconds)
                - dt.timedelta(minutes=buffer_in_minutes)
            )
        """

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

    def _get_subpackage_id_for_endpoint_id(self, endpoint_id: ir_types.EndpointId) -> ir_types.SubpackageId:
        # HACK: We should update the IR to include the subpackage_id in the OAuth configuration.
        service_id = next(
            (
                service_id
                for service_id, service in self._context.ir.services.items()
                if any(endpoint.id == endpoint_id for endpoint in service.endpoints)
            ),
            None,
        )
        subpackage_id = next(
            (
                subpackage_id
                for subpackage_id, subpackage in self._context.ir.subpackages.items()
                if subpackage.service == service_id
            ),
            None,
        )
        if subpackage_id is None:
            raise Exception(f"Could not find a subpackage associated with endpoint {endpoint_id}")
        return subpackage_id

    def _get_endpoint_for_id(self, endpoint_id: ir_types.EndpointId) -> ir_types.HttpEndpoint:
        for service in self._context.ir.services.values():
            for endpoint in service.endpoints:
                if endpoint.id == endpoint_id:
                    return endpoint
        raise Exception(f"Could not find an endpoint with id {endpoint_id}")

    def _endpoint_has_api_key_parameter(self, endpoint: ir_types.HttpEndpoint) -> bool:
        """Check if the endpoint has an api_key parameter in its request body."""
        if endpoint.request_body is None:
            return False
        
        request_body = endpoint.request_body.get_as_union()
        if request_body.type != "inlinedRequestBody":
            return False
        
        inlined_request_body = request_body
        for property in inlined_request_body.properties:
            if property.name.name.snake_case.safe_name == "api_key":
                return True
        
        return False

    def _get_api_key_constructor_parameter_name(self) -> str:
        return "api_key"

    def _get_api_key_member_name(self) -> str:
        return "_api_key"

    def _get_client_id_constructor_parameter_name(self) -> str:
        return "client_id"

    def _get_client_id_member_name(self) -> str:
        return "_client_id"

    def _get_client_secret_constructor_parameter_name(self) -> str:
        return "client_secret"

    def _get_client_secret_member_name(self) -> str:
        return "_client_secret"

    def _get_client_wrapper_constructor_parameter_name(self) -> str:
        return "client_wrapper"

    def _get_client_wrapper_member_name(self) -> str:
        return "_client_wrapper"

    def _get_access_token_constructor_parameter_name(self) -> str:
        return "access_token"

    def _get_access_token_member_name(self) -> str:
        return "_access_token"

    def _get_refresh_token_constructor_parameter_name(self) -> str:
        return "refresh_token"

    def _get_refresh_token_member_name(self) -> str:
        return "_refresh_token"

    def _get_expires_at_member_name(self) -> str:
        return "_expires_at"

    def _get_auth_client_member_name(self) -> str:
        return "_auth_client"

    def _get_buffer_in_minutes_member_name(self) -> str:
        return "BUFFER_IN_MINUTES"

    def _get_token_method_name(self) -> str:
        return "get_token"

    def _get_refresh_token_method_name(self) -> str:
        return "_refresh"

    def _get_expires_at_method_name(self) -> str:
        return "_get_expires_at"

    def _get_refresh_client_member_name(self) -> str:
        if self._refresh_client_member_name is not None:
            return self._refresh_client_member_name
        return self._get_auth_client_member_name()

    def _set_refresh_client_member_name(self) -> None:
        """
        This is only used when the token endpoint is defined on a separate service
        than the refresh endpoint.
        """
        self._refresh_client_member_name = "_refresh_client"
