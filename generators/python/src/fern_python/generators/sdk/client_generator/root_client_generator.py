import typing
from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import HttpX
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
    ConstructorParameter,
)
from fern_python.snippet import SnippetRegistry, SnippetWriter

from ..context.sdk_generator_context import SdkGeneratorContext
from ..environment_generators import (
    GeneratedEnvironment,
    MultipleBaseUrlsEnvironmentGenerator,
    SingleBaseUrlEnvironmentGenerator,
)
from .constants import DEFAULT_BODY_PARAMETER_VALUE
from .endpoint_function_generator import EndpointFunctionGenerator
from .generated_root_client import GeneratedRootClient


@dataclass
class RootClientConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    validation_check: typing.Optional[AST.Expression] = None
    private_member_name: typing.Optional[str] = None
    initializer: Optional[AST.Expression] = None
    exclude_from_wrapper_construction: Optional[bool] = False


class RootClientGenerator:
    ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME = "environment"
    ENVIRONMENT_MEMBER_NAME = "_environment"

    BASE_URL_CONSTRUCTOR_PARAMETER_NAME = "base_url"
    BASE_URL_MEMBER_NAME = "_base_url"

    HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME = "httpx_client"

    RESPONSE_VARIABLE = EndpointResponseCodeWriter.RESPONSE_VARIABLE
    RESPONSE_JSON_VARIABLE = EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE

    GET_BASEURL_FUNCTION_NAME = "_get_base_url"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        generated_environment: Optional[GeneratedEnvironment],
        class_name: str,
        async_class_name: str,
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
    ):
        self._context = context
        self._package = package
        self._class_name = class_name
        self._async_class_name = async_class_name
        self._is_default_body_parameter_used = False
        self._environments_config = self._context.ir.environments
        self._generated_environment = generated_environment
        self._snippet_registry = snippet_registry
        self._snippet_writer = snippet_writer

        client_wrapper_generator = ClientWrapperGenerator(
            context=self._context,
            generated_environment=generated_environment,
        )
        self._constructor_info = client_wrapper_generator._get_constructor_info()
        self._client_wrapper_constructor_params = self._constructor_info.constructor_parameters
        if self._context.ir.environments is not None and self._context.ir.environments.default_environment is None:
            environment_constructor_parameter = client_wrapper_generator._get_environment_constructor_parameter()
            self._client_wrapper_constructor_params.append(environment_constructor_parameter)
        elif self._context.ir.environments is None:
            base_url_constructor_parameter = client_wrapper_generator._get_base_url_constructor_parameter()
            self._client_wrapper_constructor_params.append(base_url_constructor_parameter)

        self._timeout_constructor_parameter_name = self._get_timeout_constructor_parameter_name(
            [param.constructor_parameter_name for param in self._client_wrapper_constructor_params]
        )

        self._snippet_registry = snippet_registry
        self._snippet_writer = snippet_writer

    def generate(self, source_file: SourceFile) -> GeneratedRootClient:
        builder = RootClientGenerator.GeneratedRootClientBuilder(
            module_path=self._context.get_module_path_in_project(
                self._context.get_filepath_for_root_client().to_module().path
            ),
            class_name=self._class_name,
            async_class_name=self._async_class_name,
            constructor_parameters=self._client_wrapper_constructor_params,
        )
        generated_root_client = builder.build()
        class_declaration = self._create_class_declaration(
            is_async=False,
            generated_root_client=generated_root_client,
        )
        source_file.add_arbitrary_code(AST.CodeWriter(retryer))
        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))
        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=self._create_class_declaration(
                is_async=True,
                generated_root_client=generated_root_client,
            ),
            should_export=False,
        )
        if self._environments_config is not None:
            environments_union = self._environments_config.environments.get_as_union()
            if environments_union.type == "singleBaseUrl":
                source_file.add_declaration(
                    AST.FunctionDeclaration(
                        name=RootClientGenerator.GET_BASEURL_FUNCTION_NAME,
                        signature=AST.FunctionSignature(
                            named_parameters=[
                                AST.NamedFunctionParameter(
                                    name=RootClientGenerator.BASE_URL_CONSTRUCTOR_PARAMETER_NAME,
                                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                                ),
                                AST.NamedFunctionParameter(
                                    name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                                    type_hint=AST.TypeHint(self._context.get_reference_to_environments_class())
                                    if self._environments_config.default_environment is not None
                                    else AST.TypeHint.optional(
                                        AST.TypeHint(self._context.get_reference_to_environments_class())
                                    ),
                                ),
                            ],
                            return_type=AST.TypeHint.str_(),
                        ),
                        body=AST.CodeWriter(self._write_get_base_url_function),
                    ),
                    should_export=False,
                )
        return generated_root_client

    def _create_class_declaration(
        self,
        *,
        is_async: bool,
        generated_root_client: GeneratedRootClient,
    ) -> AST.ClassDeclaration:
        constructor_parameters = self._get_constructor_parameters(is_async=is_async)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        class_declaration = AST.ClassDeclaration(
            name=self._async_class_name if is_async else self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_constructor_body(is_async=is_async, constructor_parameters=constructor_parameters)
                ),
            ),
        )

        if self._package.service is not None:
            service = self._context.ir.services[self._package.service]
            for endpoint in service.endpoints:
                endpoint_function_generator = EndpointFunctionGenerator(
                    context=self._context,
                    package=self._package,
                    service=service,
                    endpoint=endpoint,
                    idempotency_headers=self._context.ir.idempotency_headers,
                    client_wrapper_member_name=self._get_client_wrapper_member_name(),
                    is_async=is_async,
                    generated_root_client=generated_root_client,
                    snippet_writer=self._snippet_writer,
                )
                generated_endpoint_function = endpoint_function_generator.generate()
                class_declaration.add_method(generated_endpoint_function.function)
                if (
                    not self._is_default_body_parameter_used
                    and generated_endpoint_function.is_default_body_parameter_used
                ):
                    self._is_default_body_parameter_used = True

                if generated_endpoint_function.snippet is not None:
                    if is_async:
                        self._snippet_registry.register_async_client_endpoint_snippet(
                            endpoint=endpoint, expr=generated_endpoint_function.snippet
                        )
                    else:
                        self._snippet_registry.register_sync_client_endpoint_snippet(
                            endpoint=endpoint, expr=generated_endpoint_function.snippet
                        )

        return class_declaration

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
                )
            )
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint(self._context.get_reference_to_environments_class())
                    if environments_config.default_environment is not None
                    else AST.TypeHint.optional(AST.TypeHint(self._context.get_reference_to_environments_class())),
                    private_member_name=None,
                    initializer=AST.Expression(
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
                    else None,
                    exclude_from_wrapper_construction=True,
                ),
            )
        # If mutli url environment present, client should provide only environment argument
        elif environments_config.environments.get_as_union().type == "multipleBaseUrls":
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=RootClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint(self._context.get_reference_to_environments_class())
                    if environments_config.default_environment is not None
                    else AST.TypeHint.optional(AST.TypeHint(self._context.get_reference_to_environments_class())),
                    private_member_name=None,
                    initializer=AST.Expression(
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
                    else None,
                ),
            )

        client_wrapper_generator = ClientWrapperGenerator(
            context=self._context,
            generated_environment=self._generated_environment,
        )
        for param in client_wrapper_generator._get_constructor_info().constructor_parameters:
            parm_type_hint = param.type_hint
            add_validation = False
            if param.environment_variable is not None and not param.type_hint.is_optional:
                add_validation = True
                parm_type_hint = AST.TypeHint.optional(parm_type_hint)
            parameters.append(
                RootClientConstructorParameter(
                    constructor_parameter_name=param.constructor_parameter_name,
                    type_hint=parm_type_hint,
                    initializer=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                qualified_name_excluding_import=("getenv",),
                            ),
                            args=[AST.Expression(f'"{param.environment_variable}"')],
                        )
                    )
                    if param.environment_variable is not None
                    else None,
                    validation_check=AST.Expression(
                        AST.CodeWriter(
                            self._get_paramter_validation_writer(
                                param_name=param.constructor_parameter_name,
                                environment_variable=param.environment_variable,
                            )
                        )
                    )
                    if add_validation and param.environment_variable is not None
                    else None,
                )
            )

        parameters.append(
            RootClientConstructorParameter(
                constructor_parameter_name=self._timeout_constructor_parameter_name,
                type_hint=AST.TypeHint.optional(AST.TypeHint.float_()),
                initializer=AST.Expression(f"{self._context.custom_config.timeout_in_seconds}")
                if isinstance(self._context.custom_config.timeout_in_seconds, int)
                else AST.Expression(AST.TypeHint.none()),
            )
        )
        parameters.append(
            RootClientConstructorParameter(
                constructor_parameter_name=RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME,
                type_hint=AST.TypeHint.optional(AST.TypeHint(HttpX.CLIENT))
                if not is_async
                else AST.TypeHint.optional(AST.TypeHint(HttpX.ASYNC_CLIENT)),
                private_member_name=None,
                initializer=AST.Expression(AST.TypeHint.none()),
            )
        )
        return parameters

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_paramter_validation_writer(self, *, param_name: str, environment_variable: str) -> CodeWriterFunction:
        def _write_parameter_validation(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if {param_name} is None:")
            writer.indent()
            writer.write("raise ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=self._context.core_utilities.get_reference_to_api_error(),
                    kwargs=[
                        (
                            "message",
                            AST.Expression(
                                f'"The client must be instantiated be either passing in {param_name} or setting {environment_variable}"'
                            ),
                        )
                    ],
                )
            )
            writer.outdent()
            writer.write_newline_if_last_line_not()

        return _write_parameter_validation

    def _get_write_constructor_body(
        self, *, is_async: bool, constructor_parameters: List[RootClientConstructorParameter]
    ) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            for param in constructor_parameters:
                if param.validation_check is not None:
                    writer.write_node(param.validation_check)

            client_wrapper_generator = ClientWrapperGenerator(
                context=self._context,
                generated_environment=self._generated_environment,
            )
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

            for wrapper_param in client_wrapper_generator._get_constructor_info().constructor_parameters:
                client_wrapper_constructor_kwargs.append(
                    (
                        wrapper_param.constructor_parameter_name,
                        AST.Expression(wrapper_param.constructor_parameter_name),
                    )
                )
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
                                        AST.Expression(f"{self._timeout_constructor_parameter_name}"),
                                    ),
                                    (
                                        "transport",
                                        AST.Expression("Retry()"),
                                    ),
                                ],
                            ),
                            right=AST.Expression(f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME}"),
                            test=AST.Expression(
                                f"{RootClientGenerator.HTTPX_CLIENT_CONSTRUCTOR_PARAMETER_NAME} is None"
                            ),
                        ),
                    ),
                )
            )
            for param in self._get_constructor_parameters(is_async=is_async):
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
            writer.write(f"self.{self._get_client_wrapper_member_name()} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async),
                    kwargs=client_wrapper_constructor_kwargs,
                )
            )
            writer.write_newline_if_last_line_not()
            for subpackage_id in self._package.subpackages:
                subpackage = self._context.ir.subpackages[subpackage_id]
                if subpackage.has_endpoints_in_tree:
                    writer.write_node(AST.Expression(f"self.{subpackage.name.snake_case.safe_name} = "))
                    client_wrapper_constructor_kwargs = [
                        (param.constructor_parameter_name, AST.Expression(f"self.{param.constructor_parameter_name}"))
                        for param in self._get_constructor_parameters(is_async=is_async)
                    ]
                    client_wrapper_constructor_kwargs.append(
                        (
                            "client_wrapper",
                            AST.Expression(f"self.{self._get_client_wrapper_member_name()}"),
                        ),
                    )
                    writer.write_node(
                        AST.ClassInstantiation(
                            class_=self._context.get_reference_to_async_subpackage_service(subpackage_id)
                            if is_async
                            else self._context.get_reference_to_subpackage_service(subpackage_id),
                            kwargs=[
                                (
                                    "client_wrapper",
                                    AST.Expression(f"self.{self._get_client_wrapper_member_name()}"),
                                ),
                            ],
                        )
                    )
                    writer.write_line()

        return _write_constructor_body

    def _write_default_param(self, writer: AST.NodeWriter) -> None:
        writer.write_line("# this is used as the default value for optional parameters")
        writer.write(f"{DEFAULT_BODY_PARAMETER_VALUE} = ")
        writer.write_node(AST.TypeHint.cast(AST.TypeHint.any(), AST.Expression("...")))
        writer.write_newline_if_last_line_not()

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

    def _get_client_wrapper_constructor_parameter_name(
        self, params: typing.List[RootClientConstructorParameter]
    ) -> str:
        for param in params:
            if param.constructor_parameter_name == "client_wrapper":
                return "_client_wrapper"
        return "client_wrapper"

    def _get_client_wrapper_member_name(self) -> str:
        return "_client_wrapper"

    def _get_timeout_constructor_parameter_name(self, params: typing.List[str]) -> str:
        for param in params:
            if param == "timeout":
                return "_timeout"
        return "timeout"

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
            self._consrtructor_parameters = constructor_parameters

        def build(self) -> GeneratedRootClient:
            def client_snippet_writer(class_name: str) -> CodeWriterFunction:
                def write_client_snippet(writer: AST.NodeWriter) -> None:
                    client_class_reference = AST.ClassReference(
                        qualified_name_excluding_import=(),
                        import_=AST.ReferenceImport(
                            module=AST.Module.snippet(
                                module_path=self._module_path,
                            ),
                            named_import=class_name,
                        ),
                    )
                    client_instantiation = AST.ClassInstantiation(
                        class_=client_class_reference,
                        args=[
                            param.instantiation
                            for param in self._consrtructor_parameters
                            if param.instantiation is not None
                        ],
                    )

                    writer.write("client = ")
                    writer.write_node(AST.Expression(client_instantiation))
                    writer.write_newline_if_last_line_not()

                return write_client_snippet

            return GeneratedRootClient(
                async_instantiation=AST.Expression(AST.CodeWriter(client_snippet_writer(self._async_class_name))),
                sync_instantiation=AST.Expression(AST.CodeWriter(client_snippet_writer(self._class_name))),
            )


# Add retryer logic
retryer = """
import time

# Because this rate limiter doesn't block all requests, we need a relatively high limit to cope with racing threads.
retry_limit = 10

class Retry(httpx.HTTPTransport):
    def handle_request(
        self,
        request: httpx.Request,
    ) -> httpx.Response:
        retry = 0
        resp = None
        while retry < retry_limit:
            retry += 1
            try:
                if resp is not None:
                    resp.close()
                resp = super().handle_request(request)
            # Retry on request exception
            except Exception as e:
                print("httpx {} exception {} caught - retrying".format(request.url, e))
                time.sleep(1)
                continue
            # Retry on 429
            if resp.status_code == 429:
                retry_delay = resp.headers.get("Retry-After")
                print("httpx {} 429 response - retrying after {}s".format(request.url, retry_delay))
                # Sleep for the requested amount of time
                time.sleep(int(retry_delay))
                continue
            # Retry on 502
            if resp.status_code == 502:
                print("httpx {} 502 response - retrying after 30s".format(request.url))
                time.sleep(30)
                continue
            content_type = resp.headers.get("Content-Type")
            if content_type is not None:
                mime_type, _, _ = content_type.partition(";")
                if mime_type == 'application/json':
                    try:
                        resp.read()
                        resp.json()
                    except Exception as e:
                        print("httpx {} response not valid json '{}' - retrying".format(request.url, e))
                        continue
            break
        return resp
"""
