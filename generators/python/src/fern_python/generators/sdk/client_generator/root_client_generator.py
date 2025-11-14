import typing
from dataclasses import dataclass
from typing import List, Optional

from ..environment_generators import (
    GeneratedEnvironment,
    MultipleBaseUrlsEnvironmentGenerator,
    SingleBaseUrlEnvironmentGenerator,
)
from .base_wrapped_client_generator import BaseWrappedClientGenerator
from .endpoint_function_generator import EndpointFunctionGenerator
from .generated_root_client import GeneratedRootClient, RootClient
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import HttpX
from fern_python.generators.sdk.client_generator.base_client_generator import BaseClientGeneratorKwargs
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
    ConstructorParameter,
)
from typing_extensions import Unpack

import fern.ir.resources as ir_types


@dataclass
class RootClientConstructorParameter(ConstructorParameter):
    validation_check: typing.Optional[AST.Expression] = None
    exclude_from_wrapper_construction: Optional[bool] = False
    docs: Optional[str] = None


class RootClientGenerator(BaseWrappedClientGenerator[RootClientConstructorParameter]):
    ROOT_CLASS_DOCSTRING = (
        "Use this class to access the different functions within the SDK. "
        "You can instantiate any number of clients with different configuration that will propagate to these functions."
    )
    FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME = "follow_redirects"

    HEADERS_CONSTRUCTOR_PARAMETER_NAME = "headers"
    HEADERS_CONSTRUCTOR_PARAMETER_DOCS = "Additional headers to send with every request."
    HEADERS_MEMBER_NAME = "_headers"

    ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME = "environment"
    ENVIRONMENT_MEMBER_NAME = "_environment"
    ENVIRONMENT_CONSTRUCTOR_PARAMETER_DOCS = "The environment to use for requests from the client."

    BASE_URL_CONSTRUCTOR_PARAMETER_NAME = "base_url"
    BASE_URL_CONSTRUCTOR_PARAMETER_DOCS = "The base url to use for requests from the client."
    BASE_URL_MEMBER_NAME = "_base_url"

    HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME = "httpx_client"

    GET_BASEURL_FUNCTION_NAME = "_get_base_url"
    TOKEN_GETTER_PARAM_NAME = "_token_getter_override"

    def __init__(
        self,
        *,
        generated_environment: Optional[GeneratedEnvironment],
        oauth_scheme: Optional[ir_types.OAuthScheme],
        **kwargs: Unpack[BaseClientGeneratorKwargs],
    ):
        super().__init__(**kwargs)

        self._generated_environment = generated_environment
        self._oauth_scheme = oauth_scheme
        self._environments_config = self._context.ir.environments

        client_wrapper_generator = ClientWrapperGenerator(
            context=self._context,
            generated_environment=generated_environment,
        )
        exclude_auth = self._oauth_scheme is not None

        self._constructor_info = client_wrapper_generator._get_constructor_info(exclude_auth=exclude_auth)
        self._root_client_constructor_params = self._constructor_info.constructor_parameters
        if self._context.ir.environments is not None and self._context.ir.environments.default_environment is None:
            environment_constructor_parameter = client_wrapper_generator._get_environment_constructor_parameter()
            self._root_client_constructor_params.append(environment_constructor_parameter)
        elif self._context.ir.environments is None:
            base_url_constructor_parameter = client_wrapper_generator._get_base_url_constructor_parameter()
            self._root_client_constructor_params.append(base_url_constructor_parameter)

        self._timeout_constructor_parameter_name = self._get_timeout_constructor_parameter_name(
            [param.constructor_parameter_name for param in self._root_client_constructor_params]
        )

        if self._oauth_scheme is not None:
            oauth = self._oauth_scheme.configuration.get_as_union()
            if oauth.type == "clientCredentials":
                has_api_key = self._oauth_endpoint_has_api_key_parameter(oauth)
                
                if has_api_key:
                    self._root_client_constructor_params.append(
                        ConstructorParameter(
                            constructor_parameter_name="api_key",
                            type_hint=AST.TypeHint.str_(),
                            private_member_name="api_key",
                            initializer=AST.Expression('api_key="YOUR_API_KEY"'),
                        )
                    )
                self._root_client_constructor_params.append(
                    ConstructorParameter(
                        constructor_parameter_name="client_id",
                        type_hint=AST.TypeHint.str_(),
                        private_member_name="client_id",
                        initializer=AST.Expression('client_id="YOUR_CLIENT_ID"'),
                        # TODO: support OAuth credentials in templates
                        # template=TemplateGenerator.string_template(
                        #     is_optional=False,
                        #     template_string_prefix="client_id",
                        #     inputs=[
                        #         TemplateInput.factory.payload(
                        #             PayloadInput(
                        #                 location="AUTH",
                        #                 path="client_id",
                        #             )
                        #         )
                        #     ]
                        # )
                    )
                )
                self._root_client_constructor_params.append(
                    ConstructorParameter(
                        constructor_parameter_name="client_secret",
                        type_hint=AST.TypeHint.str_(),
                        private_member_name="client_secret",
                        initializer=AST.Expression('client_secret="YOUR_CLIENT_SECRET"'),
                        # TODO: support OAuth credentials in templates
                        # template=TemplateGenerator.string_template(
                        #     is_optional=False,
                        #     template_string_prefix="client_secret",
                        #     inputs=[
                        #         TemplateInput.factory.payload(
                        #             PayloadInput(
                        #                 location="AUTH",
                        #                 path="client_secret",
                        #             )
                        #         )
                        #     ]
                        # )
                    )
                )
            self._root_client_constructor_params.append(
                ConstructorParameter(
                    constructor_parameter_name=self.TOKEN_GETTER_PARAM_NAME,
                    private_member_name=self.TOKEN_GETTER_PARAM_NAME,
                    type_hint=AST.TypeHint.optional(
                        AST.TypeHint.callable(parameters=[], return_type=AST.TypeHint.str_())
                    ),
                )
            )

        exported_client_class_name = self._context.get_class_name_for_exported_root_client()
        root_client_builder = RootClientGenerator.GeneratedRootClientBuilder(
            # HACK: This is a hack to get the module path for the root client to be from the root of the project
            module_path=self._context.get_module_path_in_project(()),
            class_name=self._context.get_class_name_for_exported_root_client(),
            async_class_name="Async" + exported_client_class_name,
            constructor_parameters=self._root_client_constructor_params,
        )
        self._generated_root_client = root_client_builder.build()

    def get_generated_root_client(self) -> GeneratedRootClient:
        return self._generated_root_client

    def generate(self, source_file: SourceFile) -> None:
        class_declaration = self._create_class_declaration(
            is_async=False,
        )
        async_class_declaration = self._create_class_declaration(
            is_async=True,
        )

        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))

        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=async_class_declaration,
            should_export=False,
        )
        if self._environments_config is not None:
            environments_union = self._environments_config.environments.get_as_union()
            if environments_union.type == "singleBaseUrl":
                source_file.add_declaration(self._get_base_url_function_declaration(), should_export=False)

    def _write_root_class_docstring(self, writer: AST.NodeWriter) -> None:
        writer.write_line(self.ROOT_CLASS_DOCSTRING)

    def _create_class_declaration(
        self,
        *,
        is_async: bool,
    ) -> AST.ClassDeclaration:
        constructor_parameters = self._get_constructor_parameters(is_async=is_async)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
                docs=param.docs,
            )
            for param in constructor_parameters
        ]

        snippet = self._context.source_file_factory.create_snippet()
        snippet.add_expression(
            self._generated_root_client.async_instantiation
            if is_async
            else self._generated_root_client.sync_instantiation
        )
        class_declaration = AST.ClassDeclaration(
            name=self._async_class_name if is_async else self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_constructor_body(is_async=is_async),
                ),
            ),
            docstring=AST.Docstring(self._write_root_class_docstring),
            snippet=snippet.to_str(),
            write_parameter_docstring=True,
        )

        if self._package.service is not None:
            class_declaration.add_method(self._create_with_raw_response_method(is_async=is_async))
            service = self._context.ir.services[self._package.service]
            for endpoint in service.endpoints:
                # Handle stream parameter endpoints specially to ensure all overloads are included
                if self._is_stream_parameter_endpoint(endpoint):
                    endpoint_generator = EndpointFunctionGenerator(
                        context=self._context,
                        package=self._package,
                        service=service,
                        endpoint=endpoint,
                        idempotency_headers=self._context.ir.idempotency_headers,
                        is_async=is_async,
                        client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
                        generated_root_client=self._generated_root_client,
                        snippet_writer=self._snippet_writer,
                        endpoint_metadata_collector=self._endpoint_metadata_collector,
                        is_raw_client=False,
                    )

                    # Generate all functions (overloads + implementation)
                    generated_endpoint_functions = endpoint_generator.generate()

                    # Check if any generated function needs DEFAULT_BODY_PARAMETER
                    for generated_function in generated_endpoint_functions:
                        if generated_function.is_default_body_parameter_used:
                            self._is_default_body_parameter_used = True
                            break

                    # Add all overloads first
                    for overload_function in generated_endpoint_functions[:-1]:
                        class_declaration.add_method(overload_function.function)

                    # Then add the implementation
                    class_declaration.add_method(generated_endpoint_functions[-1].function)
                else:
                    # For non-stream parameter endpoints, use the regular approach
                    wrapper_method = self._create_wrapper_method(
                        endpoint=endpoint, is_async=is_async, generated_root_client=self._generated_root_client
                    )
                    class_declaration.add_method(wrapper_method)

        self._generate_lazy_import_properties(class_declaration=class_declaration, is_async=is_async)

        return class_declaration

    def _get_base_url_function_declaration(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name=RootClientGenerator.GET_BASEURL_FUNCTION_NAME,
            signature=AST.FunctionSignature(
                named_parameters=[
                    AST.NamedFunctionParameter(
                        name=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME,
                        type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                        docs=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_DOCS,
                    ),
                    AST.NamedFunctionParameter(
                        name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                        type_hint=(
                            AST.TypeHint(self._context.get_reference_to_environments_class())
                            if self._environments_config is not None
                            and self._environments_config.default_environment is not None
                            else AST.TypeHint.optional(
                                AST.TypeHint(self._context.get_reference_to_environments_class())
                            )
                        ),
                        docs="The environment to be used as the base url, can be used in lieu of 'base_url'.",
                    ),
                ],
                return_type=AST.TypeHint.str_(),
            ),
            body=AST.CodeWriter(self._write_get_base_url_function),
        )

    def get_raw_client_class_name(self, *, is_async: bool) -> str:
        return (
            self._context.get_class_name_for_generated_async_raw_root_client()
            if is_async
            else self._context.get_class_name_for_generated_raw_root_client()
        )

    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.ClassReference:
        return (
            self._context.get_async_raw_client_class_reference_for_root_client()
            if is_async
            else self._context.get_raw_client_class_reference_for_root_client()
        )

    def _get_constructor_parameters(self, *, is_async: bool) -> List[RootClientConstructorParameter]:
        parameters: List[RootClientConstructorParameter] = []

        environments_config = self._context.ir.environments
        # If no environments, client should only provide base_url argument
        if environments_config is None:
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint.str_(),
                    private_member_name=None,
                    initializer=None,
                    docs=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_DOCS,
                )
            )
        # If single url environment present, client should provide both base_url and environment arguments
        elif environments_config.environments.get_as_union().type == "singleBaseUrl":
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    private_member_name=None,
                    initializer=AST.Expression("None"),
                    exclude_from_wrapper_construction=True,
                    docs=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_DOCS,
                )
            )
            default_environment = (
                AST.Expression(
                    environments_config.environments.visit(
                        single_base_url=lambda single_base_url_environments: SingleBaseUrlEnvironmentGenerator(
                            context=self._context, environments=single_base_url_environments
                        ).get_reference_to_default_environment(),
                        multiple_base_urls=lambda multiple_base_urls_environments: MultipleBaseUrlsEnvironmentGenerator(
                            context=self._context, environments=multiple_base_urls_environments
                        ).get_reference_to_default_environment(),
                    )
                )
                if environments_config.default_environment is not None
                else None
            )
            environment_docs = f"{RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_DOCS}"
            if default_environment is not None:
                snippet = self._context.source_file_factory.create_snippet()

                def write_default_environment(writer: AST.NodeWriter) -> None:
                    writer.write("Defaults to ")
                    writer.write_node(default_environment)  # type: ignore

                snippet.add_arbitrary_code(AST.CodeWriter(code_writer=write_default_environment))
                environment_docs += f" {snippet.to_str()}"
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=(
                        AST.TypeHint(self._context.get_reference_to_environments_class())
                        if environments_config.default_environment is not None
                        else AST.TypeHint.optional(AST.TypeHint(self._context.get_reference_to_environments_class()))
                    ),
                    private_member_name=None,
                    initializer=default_environment if default_environment is not None else None,
                    exclude_from_wrapper_construction=True,
                    docs=environment_docs,
                ),
            )
        # If multi url environment present, client should provide only environment argument
        elif environments_config.environments.get_as_union().type == "multipleBaseUrls":
            default_environment = (
                AST.Expression(
                    environments_config.environments.visit(
                        single_base_url=lambda single_base_url_environments: SingleBaseUrlEnvironmentGenerator(
                            context=self._context, environments=single_base_url_environments
                        ).get_reference_to_default_environment(),
                        multiple_base_urls=lambda multiple_base_urls_environments: MultipleBaseUrlsEnvironmentGenerator(
                            context=self._context, environments=multiple_base_urls_environments
                        ).get_reference_to_default_environment(),
                    )
                )
                if environments_config.default_environment is not None
                else None
            )
            environment_docs = f"{RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_DOCS}"
            if default_environment is not None:
                snippet = self._context.source_file_factory.create_snippet()

                def write_default_environment(writer: AST.NodeWriter) -> None:
                    writer.write("Defaults to ")
                    writer.write_node(default_environment)  # type: ignore

                snippet.add_arbitrary_code(AST.CodeWriter(code_writer=write_default_environment))
                environment_docs += f" {snippet.to_str()}"
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint(self._context.get_reference_to_environments_class()),
                    private_member_name=None,
                    initializer=default_environment if default_environment is not None else None,
                    docs=environment_docs,
                ),
            )

        client_wrapper_generator = ClientWrapperGenerator(
            context=self._context,
            generated_environment=self._generated_environment,
        )
        exclude_auth = self._oauth_scheme is not None
        for param in client_wrapper_generator._get_constructor_info(exclude_auth=exclude_auth).constructor_parameters:
            parm_type_hint = param.type_hint
            add_validation = False
            if param.environment_variable is not None and not param.type_hint.is_optional:
                add_validation = True
                parm_type_hint = AST.TypeHint.optional(parm_type_hint)
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=param.constructor_parameter_name,
                    type_hint=parm_type_hint,
                    initializer=(
                        AST.Expression(
                            AST.FunctionInvocation(
                                function_definition=AST.Reference(
                                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                    qualified_name_excluding_import=("getenv",),
                                ),
                                args=[AST.Expression(f'"{param.environment_variable}"')],
                            )
                        )
                        if param.environment_variable is not None
                        else None
                    ),
                    docs=param.docs,
                    validation_check=(
                        AST.Expression(
                            AST.CodeWriter(
                                self._get_parameter_validation_writer(
                                    param_name=param.constructor_parameter_name,
                                    environment_variable=param.environment_variable,
                                )
                            )
                        )
                        if add_validation and param.environment_variable is not None
                        else None
                    ),
                )
            )

        if self._oauth_scheme is not None:
            oauth = self._oauth_scheme.configuration.get_as_union()
            if oauth.type == "clientCredentials":
                has_api_key = self._oauth_endpoint_has_api_key_parameter(oauth)
                
                if has_api_key:
                    parameters.append(
                        RootClientConstructorParameter(
                            constructor_parameter_name="api_key",
                            type_hint=AST.TypeHint.str_(),
                            initializer=None,
                        ),
                    )

                cred_type_hint = AST.TypeHint.str_()
                add_validation = False
                if oauth.client_id_env_var is not None:
                    add_validation = True
                    cred_type_hint = AST.TypeHint.optional(cred_type_hint)
                parameters.append(
                    RootClientConstructorParameter(
                        constructor_parameter_name="client_id",
                        type_hint=cred_type_hint,
                        initializer=(
                            AST.Expression(
                                AST.FunctionInvocation(
                                    function_definition=AST.Reference(
                                        import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                        qualified_name_excluding_import=("getenv",),
                                    ),
                                    args=[AST.Expression(f'"{oauth.client_id_env_var}"')],
                                )
                            )
                            if oauth.client_id_env_var is not None
                            else None
                        ),
                        validation_check=(
                            AST.Expression(
                                AST.CodeWriter(
                                    self._get_parameter_validation_writer(
                                        param_name="client_id",
                                        environment_variable=oauth.client_id_env_var,
                                    )
                                )
                            )
                            if add_validation and oauth.client_id_env_var is not None
                            else None
                        ),
                    ),
                )

                sec_cred_type_hint = AST.TypeHint.str_()
                sec_add_validation = False
                if oauth.client_secret_env_var is not None:
                    sec_add_validation = True
                    sec_cred_type_hint = AST.TypeHint.optional(sec_cred_type_hint)
                parameters.append(
                    RootClientConstructorParameter(
                        constructor_parameter_name="client_secret",
                        type_hint=sec_cred_type_hint,
                        initializer=(
                            AST.Expression(
                                AST.FunctionInvocation(
                                    function_definition=AST.Reference(
                                        import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                        qualified_name_excluding_import=("getenv",),
                                    ),
                                    args=[AST.Expression(f'"{oauth.client_secret_env_var}"')],
                                )
                            )
                            if oauth.client_secret_env_var is not None
                            else None
                        ),
                        validation_check=(
                            AST.Expression(
                                AST.CodeWriter(
                                    self._get_parameter_validation_writer(
                                        param_name="client_secret",
                                        environment_variable=oauth.client_secret_env_var,
                                    )
                                )
                            )
                            if sec_add_validation and oauth.client_secret_env_var is not None
                            else None
                        ),
                    ),
                )
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=self.TOKEN_GETTER_PARAM_NAME,
                    type_hint=AST.TypeHint.optional(
                        AST.TypeHint.callable(parameters=[], return_type=AST.TypeHint.str_())
                    ),
                    initializer=AST.Expression("None"),
                ),
            )

        timeout_phrase = (
            f"the timeout is {self._context.custom_config.timeout_in_seconds} seconds"
            if isinstance(self._context.custom_config.timeout_in_seconds, int)
            else "there is no timeout set"
        )
        parameters.append(
            RootClientConstructorParameter(
                constructor_parameter_name=self._timeout_constructor_parameter_name,
                type_hint=AST.TypeHint.optional(AST.TypeHint.float_()),
                docs=f"The timeout to be used, in seconds, for requests. By default {timeout_phrase}, unless a custom httpx client is used, in which case this default is not enforced.",
            )
        )

        parameters.append(
            RootClientConstructorParameter(
                constructor_parameter_name=self.FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME,
                type_hint=AST.TypeHint.optional(AST.TypeHint.bool_()),
                docs="Whether the default httpx client follows redirects or not, this is irrelevant if a custom httpx client is passed in.",
                # This config is optional in the event httpx ever changes it's default behavior, we stay up to date with
                # that as opposed to forming an opinion on what the default should be.
                initializer=AST.Expression(
                    "True"
                    if self._context.custom_config.follow_redirects_by_default == True
                    else "False"
                    if self._context.custom_config.follow_redirects_by_default == False
                    else "None"
                ),
            )
        )

        parameters.append(
            RootClientConstructorParameter(
                constructor_parameter_name=RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME,
                type_hint=(
                    AST.TypeHint.optional(AST.TypeHint(HttpX.CLIENT))
                    if not is_async
                    else AST.TypeHint.optional(AST.TypeHint(HttpX.ASYNC_CLIENT))
                ),
                private_member_name=None,
                initializer=AST.Expression(AST.TypeHint.none()),
                docs="The httpx client to use for making requests, a preconfigured client is used by default, however this is useful should you want to pass in any custom httpx configuration.",
            )
        )
        parameters.extend(self._get_literal_header_parameters())

        return parameters

    def _get_parameter_validation_writer(self, *, param_name: str, environment_variable: str) -> CodeWriterFunction:
        def _write_parameter_validation(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if {param_name} is None:")
            writer.indent()
            writer.write("raise ")
            writer.write_node(
                self._context.core_utilities.instantiate_api_error(
                    headers=None,
                    status_code=None,
                    body=AST.Expression(
                        f'"The client must be instantiated be either passing in {param_name} or setting {environment_variable}"'
                    ),
                )
            )
            writer.outdent()
            writer.write_newline_if_last_line_not()

        return _write_parameter_validation

    def _get_literal_header_parameters(self) -> List[RootClientConstructorParameter]:
        parameters: List[RootClientConstructorParameter] = []
        for header in self._context.ir.headers:
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(header.value_type)
            if not type_hint.is_literal:
                continue
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=header.name.name.snake_case.safe_name,
                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    initializer=AST.Expression(AST.TypeHint.none()),
                )
            )
        return parameters

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            timeout_local_variable = "_defaulted_timeout"
            writer.write(f"{timeout_local_variable} = ")
            writer.write_node(
                AST.Expression(
                    AST.ConditionalExpression(
                        left=AST.Expression(f"{self._timeout_constructor_parameter_name}"),
                        right=AST.ConditionalExpression(
                            left=(
                                AST.Expression(f"{self._context.custom_config.timeout_in_seconds}")
                                if isinstance(self._context.custom_config.timeout_in_seconds, int)
                                else AST.Expression(AST.TypeHint.none())
                            ),
                            right=AST.Expression(
                                f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME}.timeout.read"
                            ),
                            test=AST.Expression(
                                f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME} is None"
                            ),
                        ),
                        test=AST.Expression(f"{self._timeout_constructor_parameter_name} is not None"),
                    ),
                ),
            )

            constructor_parameters = self._get_constructor_parameters(is_async=is_async)
            for param in constructor_parameters:
                if param.validation_check is not None:
                    writer.write_node(param.validation_check)

            client_wrapper_generator = ClientWrapperGenerator(
                context=self._context,
                generated_environment=self._generated_environment,
            )
            use_oauth_token_provider = self._oauth_scheme is not None
            if use_oauth_token_provider:
                oauth = self._oauth_scheme.configuration.get_as_union()
                has_api_key = self._oauth_endpoint_has_api_key_parameter(oauth) if oauth.type == "clientCredentials" else False
                
                client_wrapper_constructor_kwargs = self._get_client_wrapper_kwargs(
                    client_wrapper_generator=client_wrapper_generator,
                    environments_config=self._environments_config,
                    timeout_local_variable=timeout_local_variable,
                    is_async=False,
                    ignore_httpx_constructor_parameter=True,
                    exclude_auth=True,
                )
                
                oauth_kwargs = []
                if has_api_key:
                    oauth_kwargs.append(
                        (
                            "api_key",
                            AST.Expression("api_key"),
                        )
                    )
                
                oauth_kwargs.extend([
                    (
                        "client_id",
                        AST.Expression("client_id"),
                    ),
                    (
                        "client_secret",
                        AST.Expression("client_secret"),
                    ),
                    (
                        "client_wrapper",
                        AST.Expression(
                            AST.ClassInstantiation(
                                class_=self._context.core_utilities.get_reference_to_client_wrapper(
                                    is_async=False
                                ),
                                kwargs=client_wrapper_constructor_kwargs,
                            ),
                        ),
                    ),
                ])
                
                writer.write("oauth_token_provider = ")
                writer.write_node(
                    AST.ClassInstantiation(
                        class_=self._context.core_utilities.get_oauth_token_provider(),
                        kwargs=oauth_kwargs,
                    )
                )
                writer.write_newline_if_last_line_not()
            client_wrapper_constructor_kwargs = self._get_client_wrapper_kwargs(
                client_wrapper_generator=client_wrapper_generator,
                environments_config=self._environments_config,
                timeout_local_variable=timeout_local_variable,
                is_async=is_async,
                use_oauth_token_provider=use_oauth_token_provider,
            )
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
            writer.write(f"self.{self._get_client_wrapper_member_name()} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async),
                    kwargs=client_wrapper_constructor_kwargs,
                )
            )
            if self._package.service is not None:
                writer.write_newline_if_last_line_not()
                writer.write_node(
                    AST.VariableDeclaration(
                        name=f"self.{self._get_raw_client_member_name()}",
                        initializer=AST.Expression(
                            AST.ClassInstantiation(
                                class_=(
                                    self._context.get_async_raw_client_class_reference_for_root_client()
                                    if is_async
                                    else self._context.get_raw_client_class_reference_for_root_client()
                                ),
                                kwargs=[
                                    (
                                        "client_wrapper",
                                        AST.Expression(f"self.{self._get_client_wrapper_member_name()}"),
                                    ),
                                ],
                            )
                        ),
                    )
                )
            writer.write_newline_if_last_line_not()

            self._initialize_nested_clients(writer=writer, is_async=is_async, declare_client_wrapper=False)

        return _write_constructor_body

    def _get_client_wrapper_kwargs(
        self,
        client_wrapper_generator: ClientWrapperGenerator,
        environments_config: Optional[ir_types.EnvironmentsConfig],
        timeout_local_variable: str,
        is_async: bool,
        exclude_auth: Optional[bool] = False,
        ignore_httpx_constructor_parameter: bool = False,
        use_oauth_token_provider: bool = False,
    ) -> List[typing.Tuple[str, AST.Expression]]:
        client_wrapper_constructor_kwargs = []

        environments_config = self._context.ir.environments
        # If no environments, client should only provide base_url argument
        if environments_config is None:
            client_wrapper_constructor_kwargs.append(
                (
                    ClientWrapperGenerator.BASE_URL_PARAMETER_NAME,
                    AST.Expression(RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME),
                )
            )
        elif environments_config.environments.get_as_union().type == "singleBaseUrl":
            client_wrapper_constructor_kwargs.append(
                (
                    ClientWrapperGenerator.BASE_URL_PARAMETER_NAME,
                    AST.Expression(
                        f"{RootClientGenerator.GET_BASEURL_FUNCTION_NAME}({RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME}={RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME}, {RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME}={RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME})"
                    ),
                )
            )
        elif environments_config.environments.get_as_union().type == "multipleBaseUrls":
            client_wrapper_constructor_kwargs.append(
                (
                    ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME,
                    AST.Expression(RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME),
                )
            )

        constructor_info = client_wrapper_generator._get_constructor_info(
            exclude_auth=exclude_auth if exclude_auth else use_oauth_token_provider
        )
        for wrapper_param in constructor_info.constructor_parameters:
            client_wrapper_constructor_kwargs.append(
                (
                    wrapper_param.constructor_parameter_name,
                    AST.Expression(wrapper_param.constructor_parameter_name),
                )
            )

        if use_oauth_token_provider:
            client_wrapper_constructor_kwargs.append(
                (
                    "token",
                    AST.Expression(
                        f"{self.TOKEN_GETTER_PARAM_NAME} if {self.TOKEN_GETTER_PARAM_NAME} is not None else oauth_token_provider.get_token"
                    ),
                )
            )

        if ignore_httpx_constructor_parameter:
            client_wrapper_constructor_kwargs.append(
                (
                    ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME,
                    AST.Expression(
                        AST.ConditionalExpression(
                            left=AST.ClassInstantiation(
                                HttpX.ASYNC_CLIENT if is_async else HttpX.CLIENT,
                                kwargs=[
                                    (
                                        "timeout",
                                        AST.Expression(f"{timeout_local_variable}"),
                                    ),
                                    (
                                        "follow_redirects",
                                        AST.Expression(f"{self.FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME}"),
                                    ),
                                ],
                            ),
                            right=AST.ClassInstantiation(
                                HttpX.ASYNC_CLIENT if is_async else HttpX.CLIENT,
                                kwargs=[
                                    (
                                        "timeout",
                                        AST.Expression(f"{timeout_local_variable}"),
                                    ),
                                ],
                            ),
                            test=AST.Expression(f"{self.FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME} is not None"),
                        ),
                    ),
                ),
            )
        else:
            client_wrapper_constructor_kwargs.append(
                (
                    ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME,
                    AST.Expression(
                        AST.ConditionalExpression(
                            left=AST.Expression(f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME}"),
                            right=AST.ConditionalExpression(
                                left=AST.ClassInstantiation(
                                    HttpX.ASYNC_CLIENT if is_async else HttpX.CLIENT,
                                    kwargs=[
                                        (
                                            "timeout",
                                            AST.Expression(f"{timeout_local_variable}"),
                                        ),
                                        (
                                            "follow_redirects",
                                            AST.Expression(f"{self.FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME}"),
                                        ),
                                    ],
                                ),
                                right=AST.ClassInstantiation(
                                    HttpX.ASYNC_CLIENT if is_async else HttpX.CLIENT,
                                    kwargs=[
                                        (
                                            "timeout",
                                            AST.Expression(f"{timeout_local_variable}"),
                                        ),
                                    ],
                                ),
                                test=AST.Expression(f"{self.FOLLOW_REDIRECTS_CONSTRUCTOR_PARAMETER_NAME} is not None"),
                            ),
                            test=AST.Expression(
                                f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME} is not None"
                            ),
                        ),
                    ),
                )
            )
        client_wrapper_constructor_kwargs.append(
            (
                ClientWrapperGenerator.TIMEOUT_PARAMETER_NAME,
                AST.Expression(timeout_local_variable),
            )
        )

        for literal_header in constructor_info.literal_headers:
            client_wrapper_constructor_kwargs.append(
                (
                    literal_header.header.name.name.snake_case.safe_name,
                    AST.Expression(literal_header.header.name.name.snake_case.safe_name),
                )
            )

        return client_wrapper_constructor_kwargs

    def _write_get_base_url_function(self, writer: AST.NodeWriter) -> None:
        writer.write_line(f"if {RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME} is not None:")
        with writer.indent():
            writer.write_line(f"return {RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME}")
        writer.write_line(f"elif {RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME} is not None:")
        with writer.indent():
            writer.write_line(f"return {RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME}.value")
        writer.write("else:")
        with writer.indent():
            writer.write_line(
                'raise Exception("Please pass in either base_url or environment to construct the client")'
            )
        writer.write_newline_if_last_line_not()

    def _get_timeout_constructor_parameter_name(self, params: typing.List[str]) -> str:
        for param in params:
            if param == "timeout":
                return "_timeout"
        return "timeout"

    def _oauth_endpoint_has_api_key_parameter(self, oauth: ir_types.OAuthClientCredentials) -> bool:
        """Check if the OAuth endpoint has an api_key parameter in its request body."""
        endpoint_id = (
            oauth.refresh_endpoint.endpoint_reference.endpoint_id
            if oauth.refresh_endpoint is not None
            else oauth.token_endpoint.endpoint_reference.endpoint_id
        )
        
        endpoint = self._get_endpoint_for_id(endpoint_id)
        if endpoint is None or endpoint.request_body is None:
            return False
        
        request_body = endpoint.request_body.get_as_union()
        if request_body.type != "inlinedRequestBody":
            return False
        
        for property in request_body.properties:
            if property.name.name.snake_case.safe_name == "api_key":
                return True
        
        return False

    def _get_endpoint_for_id(self, endpoint_id: ir_types.EndpointId) -> typing.Optional[ir_types.HttpEndpoint]:
        """Get the endpoint for the given endpoint ID."""
        for service in self._context.ir.services.values():
            for endpoint in service.endpoints:
                if endpoint.id == endpoint_id:
                    return endpoint
        return None

    class GeneratedRootClientBuilder:
        def __init__(
            self,
            module_path: AST.ModulePath,
            class_name: str,
            async_class_name: str,
            constructor_parameters: List[ConstructorParameter],
        ):
            self._module_path = module_path
            self._class_name = class_name
            self._async_class_name = async_class_name
            self._constructor_parameters = constructor_parameters

        def build(self) -> GeneratedRootClient:
            def client_snippet_writer(class_name: str) -> typing.Tuple[AST.ClassReference, CodeWriterFunction]:
                client_class_reference = AST.ClassReference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.snippet(
                            module_path=self._module_path,
                        ),
                        named_import=class_name,
                    ),
                )

                def write_client_snippet(writer: AST.NodeWriter) -> None:
                    client_instantiation = AST.ClassInstantiation(
                        class_=client_class_reference,
                        args=[
                            param.initializer for param in self._constructor_parameters if param.initializer is not None
                        ],
                    )

                    writer.write("client = ")
                    writer.write_node(AST.Expression(client_instantiation))
                    writer.write_newline_if_last_line_not()

                return client_class_reference, write_client_snippet

            async_class_reference, async_class_snippet_writer = client_snippet_writer(self._async_class_name)
            sync_class_reference, sync_class_snippet_writer = client_snippet_writer(self._class_name)
            return GeneratedRootClient(
                async_instantiation=AST.Expression(AST.CodeWriter(async_class_snippet_writer)),
                async_client=RootClient(class_reference=async_class_reference, parameters=self._constructor_parameters),
                sync_instantiation=AST.Expression(AST.CodeWriter(sync_class_snippet_writer)),
                sync_client=RootClient(class_reference=sync_class_reference, parameters=self._constructor_parameters),
            )
