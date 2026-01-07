import os
from typing import Dict, Optional, Set, Tuple, Union

from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.reference_node.reference_node import ReferenceNode
from fern_python.codegen.ast.references.module import Module
from fern_python.codegen.ast.references.reference import Reference, ReferenceImport
from fern_python.codegen.filepath import Filepath
from fern_python.codegen.project import Project
from fern_python.codegen.source_file import SourceFile
from fern_python.generator_exec_wrapper.generator_exec_wrapper import (
    GeneratorExecWrapper,
)
from fern_python.generators.sdk.client_generator.endpoint_function_generator import (
    EndpointFunctionGenerator,
)
from fern_python.generators.sdk.client_generator.generated_root_client import (
    GeneratedRootClient,
    RootClient,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.custom_config import SmokeTestConfig
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    MultipleBaseUrlsEnvironmentGenerator,
)
from fern_python.generators.sdk.environment_generators.single_base_url_environment_generator import (
    SingleBaseUrlEnvironmentGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.source_file_factory.source_file_factory import SourceFileFactory

import fern.ir.resources as ir_types


class SmokeTestFactory:
    """
    Factory for generating smoke tests that can be run against a production environment.

    Unlike wire tests which validate exact response values, smoke tests:
    1. Run against a real production API (not a mock server)
    2. Validate response structure and types (not exact values)
    3. Support filtering examples via include/exclude lists
    """

    SYNC_CLIENT_FIXTURE_NAME = "client"
    ASYNC_CLIENT_FIXTURE_NAME = "async_client"
    ENVVAR_PREFIX = "SMOKE_TEST_"
    BASE_URL_ENVVAR = "SMOKE_TEST_BASE_URL"

    def __init__(
        self,
        project: Project,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        generated_root_client: GeneratedRootClient,
        generated_environment: Optional[Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator]],
        smoke_test_config: SmokeTestConfig,
    ) -> None:
        self._project = project
        self._context = context
        self._generator_exec_wrapper = generator_exec_wrapper
        self._generated_root_client = generated_root_client
        self._generated_environment = (
            generated_environment
            if generated_environment is not None and type(generated_environment) is MultipleBaseUrlsEnvironmentGenerator
            else None
        )
        self._smoke_test_config = smoke_test_config

        self._test_base_path = Filepath.DirectoryFilepathPart(
            module_name="tests",
        )
        self._smoke_test_path = Filepath.DirectoryFilepathPart(
            module_name="smoke",
        )

        self._service_test_files: Dict[Filepath, SourceFile] = dict()

        # Parse include/exclude patterns for test generation
        self._include_patterns: Set[str] = set()
        self._exclude_patterns: Set[str] = set()
        if smoke_test_config.include_examples:
            self._include_patterns = set(smoke_test_config.include_examples)
        if smoke_test_config.exclude_examples:
            self._exclude_patterns = set(smoke_test_config.exclude_examples)

        # Parse structural validation patterns
        self._structural_include_patterns: Optional[Set[str]] = None
        self._structural_exclude_patterns: Set[str] = set()
        if smoke_test_config.structural_validation.include_examples is not None:
            self._structural_include_patterns = set(smoke_test_config.structural_validation.include_examples)
        if smoke_test_config.structural_validation.exclude_examples:
            self._structural_exclude_patterns = set(smoke_test_config.structural_validation.exclude_examples)

        # Parse strict validation patterns
        self._strict_include_patterns: Optional[Set[str]] = None
        self._strict_exclude_patterns: Set[str] = set()
        if smoke_test_config.strict_validation.include_examples is not None:
            self._strict_include_patterns = set(smoke_test_config.strict_validation.include_examples)
        if smoke_test_config.strict_validation.exclude_examples:
            self._strict_exclude_patterns = set(smoke_test_config.strict_validation.exclude_examples)

    def _should_include_example(
        self,
        service_name: str,
        endpoint_name: str,
        example_name: Optional[str],
    ) -> bool:
        """
        Determine if an example should be included in smoke tests based on
        the include/exclude configuration.

        Patterns can be:
        - "ServiceName.methodName" - matches all examples for that endpoint
        - "ServiceName.methodName:exampleName" - matches a specific example
        """
        endpoint_pattern = f"{service_name}.{endpoint_name}"
        example_pattern = f"{endpoint_pattern}:{example_name}" if example_name else None

        # If include patterns are specified, only include matching examples
        if self._include_patterns:
            if endpoint_pattern in self._include_patterns:
                return True
            if example_pattern and example_pattern in self._include_patterns:
                return True
            return False

        # If exclude patterns are specified, exclude matching examples
        if self._exclude_patterns:
            if endpoint_pattern in self._exclude_patterns:
                return False
            if example_pattern and example_pattern in self._exclude_patterns:
                return False

        # Default: include all user-specified examples
        return True

    def _should_structural_validate(
        self,
        service_name: str,
        endpoint_name: str,
        example_name: Optional[str],
    ) -> bool:
        """
        Determine if structural validation should run for an example.
        By default, structural validation runs on all examples unless excluded.
        """
        endpoint_pattern = f"{service_name}.{endpoint_name}"
        example_pattern = f"{endpoint_pattern}:{example_name}" if example_name else None

        # If include patterns are specified (not None), only include matching examples
        if self._structural_include_patterns is not None:
            if len(self._structural_include_patterns) == 0:
                return False
            if endpoint_pattern in self._structural_include_patterns:
                return True
            if example_pattern and example_pattern in self._structural_include_patterns:
                return True
            return False

        # If exclude patterns are specified, exclude matching examples
        if self._structural_exclude_patterns:
            if endpoint_pattern in self._structural_exclude_patterns:
                return False
            if example_pattern and example_pattern in self._structural_exclude_patterns:
                return False

        # Default: structural validation runs on all examples
        return True

    def _should_strict_validate(
        self,
        service_name: str,
        endpoint_name: str,
        example_name: Optional[str],
    ) -> bool:
        """
        Determine if strict validation should run for an example.
        By default, strict validation is disabled (empty include list).
        """
        endpoint_pattern = f"{service_name}.{endpoint_name}"
        example_pattern = f"{endpoint_pattern}:{example_name}" if example_name else None

        # If include patterns are None, strict validation is disabled
        if self._strict_include_patterns is None:
            return False

        # If include patterns are empty, strict validation is disabled
        if len(self._strict_include_patterns) == 0:
            return False

        # Check if example matches include patterns
        included = False
        if endpoint_pattern in self._strict_include_patterns:
            included = True
        if example_pattern and example_pattern in self._strict_include_patterns:
            included = True

        if not included:
            return False

        # Check exclude patterns
        if self._strict_exclude_patterns:
            if endpoint_pattern in self._strict_exclude_patterns:
                return False
            if example_pattern and example_pattern in self._strict_exclude_patterns:
                return False

        return True

    def _return_expression(self, returned_expression: AST.ClassInstantiation) -> AST.CodeWriter:
        def return_writer(writer: AST.NodeWriter) -> None:
            writer.write("return ")
            writer.write_node(returned_expression)
            writer.write_newline_if_last_line_not()

        return AST.CodeWriter(return_writer)

    def _write_envvar_parameter(
        self, parameter_name: str, envvar_name: str, default_value: Optional[str] = None
    ) -> AST.Expression:
        args = [AST.Expression(f'"{envvar_name}"')]
        if default_value:
            args.append(AST.Expression(f'"{default_value}"'))
        os_get = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                    qualified_name_excluding_import=("getenv",),
                ),
                args=args,
            )
        )

        def envvar_writer(writer: AST.NodeWriter) -> None:
            writer.write(f"{parameter_name}=")
            writer.write_node(os_get)
            writer.write_newline_if_last_line_not()

        return AST.Expression(AST.CodeWriter(envvar_writer))

    def _environment(self, generated_environment: MultipleBaseUrlsEnvironmentGenerator) -> AST.ClassInstantiation:
        args = [AST.Expression(f'"{self.BASE_URL_ENVVAR}"'), AST.Expression('"base_url"')]
        os_get = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                    qualified_name_excluding_import=("getenv",),
                ),
                args=args,
            )
        )

        class_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self._context.get_module_path_in_project(
                        self._context.get_filepath_for_environments_enum().to_module().path
                    ),
                ),
                named_import=generated_environment.class_name,
            ),
        )
        return AST.ClassInstantiation(
            class_=class_reference,
            kwargs=[(env, os_get) for env in generated_environment.args],
        )

    def _instantiate_client(self, client: RootClient) -> AST.ClassInstantiation:
        # Parameters that should be excluded from env var handling
        # (either handled specially or not suitable for string env vars)
        excluded_params = {
            "base_url",
            "environment",
            "_token_getter_override",
            "headers",  # dict type, not suitable for string env var
            "httpx_client",  # client instance, not suitable for env var
            "timeout",  # numeric/complex type
            "follow_redirects",  # boolean type
        }
        non_url_params = [
            self._write_envvar_parameter(
                param.constructor_parameter_name,
                self.ENVVAR_PREFIX + param.constructor_parameter_name.upper(),
                param.constructor_parameter_name,
            )
            for param in client.parameters
            if param.constructor_parameter_name not in excluded_params
        ]

        _kwargs = []
        param_names = [param.constructor_parameter_name for param in client.parameters]
        if "_token_getter_override" in param_names:
            _kwargs.append(
                (
                    "_token_getter_override",
                    AST.Expression(f'lambda: os.getenv("{self.ENVVAR_PREFIX}TOKEN", "token")'),
                )
            )

        if self._generated_environment is None:
            non_url_params.append(self._write_envvar_parameter("base_url", self.BASE_URL_ENVVAR, "base_url"))
        else:
            _kwargs.append(
                (
                    "environment",
                    AST.Expression(self._environment(self._generated_environment)),
                )
            )

        return AST.ClassInstantiation(
            class_=client.class_reference,
            args=non_url_params,
            kwargs=_kwargs,
        )

    def _generate_client_fixture(self) -> None:
        # Note the conftest name is important, and required to make these fixtures available to all tests
        utilities_filepath = Filepath(
            directories=(
                self._test_base_path,
                self._smoke_test_path,
            ),
            file=Filepath.FilepathPart(module_name="conftest"),
        )

        source_file = self._context.source_file_factory.create(
            project=self._project,
            filepath=utilities_filepath,
            generator_exec_wrapper=self._generator_exec_wrapper,
            from_src=False,
        )

        # Add a module docstring explaining smoke tests
        source_file.add_expression(
            AST.Expression(
                AST.CodeWriter(
                    lambda writer: writer.write_line(
                        '"""Pytest fixtures for smoke tests that run against a production environment."""'
                    )
                )
            )
        )

        sync_function_declaration = AST.FunctionDeclaration(
            name=self.SYNC_CLIENT_FIXTURE_NAME,
            decorators=[
                ReferenceNode(
                    Reference(
                        qualified_name_excluding_import=("fixture",),
                        import_=ReferenceImport(module=Module.built_in(("pytest",))),
                    )
                )
            ],
            signature=AST.FunctionSignature(
                parameters=[],
                named_parameters=[],
                return_type=AST.TypeHint(self._generated_root_client.sync_client.class_reference),
            ),
            body=self._return_expression(self._instantiate_client(self._generated_root_client.sync_client)),
        )
        source_file.add_expression(AST.Expression(sync_function_declaration))

        async_function_declaration = AST.FunctionDeclaration(
            name=self.ASYNC_CLIENT_FIXTURE_NAME,
            decorators=[
                ReferenceNode(
                    Reference(
                        qualified_name_excluding_import=("fixture",),
                        import_=ReferenceImport(module=Module.built_in(("pytest",))),
                    )
                )
            ],
            signature=AST.FunctionSignature(
                parameters=[],
                named_parameters=[],
                return_type=AST.TypeHint(self._generated_root_client.async_client.class_reference),
            ),
            body=self._return_expression(self._instantiate_client(self._generated_root_client.async_client)),
        )
        source_file.add_expression(AST.Expression(async_function_declaration))

        self._project.write_source_file(source_file=source_file, filepath=utilities_filepath, include_src_root=False)

    def _get_filepath_for_fern_filepath(self, fern_filepath: ir_types.FernFilepath) -> Filepath:
        directories: Tuple[Filepath.DirectoryFilepathPart, ...] = (
            self._test_base_path,
            self._smoke_test_path,
        )

        for pathpart in fern_filepath.package_path:
            directories += (
                Filepath.DirectoryFilepathPart(
                    module_name=pathpart.snake_case.safe_name,
                ),
            )

        module_name = fern_filepath.file.snake_case.safe_name if fern_filepath.file is not None else "root"
        return Filepath(
            directories=directories,
            file=Filepath.FilepathPart(module_name=f"test_{module_name}_smoke"),
        )

    def _generate_type_expectations_for_type_reference(self, reference: ir_types.ExampleTypeReference) -> object:
        """Generate type expectations for structural validation."""
        return reference.shape.visit(
            primitive=lambda primitive: primitive.visit(
                integer=lambda _: "integer",
                double=lambda _: "float",
                uint=lambda _: "integer",
                uint_64=lambda _: "integer",
                float_=lambda _: "float",
                base_64=lambda _: "string",
                big_integer=lambda _: "string",
                string=lambda _: "string",
                boolean=lambda _: "boolean",
                long_=lambda _: "integer",
                datetime=lambda _: "datetime",
                date=lambda _: "date",
                uuid_=lambda _: "uuid",
            ),
            container=lambda container: container.visit(
                list_=lambda item_type: (
                    "list",
                    dict(
                        [
                            (idx, self._generate_type_expectations_for_type_reference(ex))
                            for idx, ex in enumerate(item_type.list_)
                        ]
                    ),
                ),
                set_=lambda item_type: (
                    "set",
                    dict(
                        [
                            (idx, self._generate_type_expectations_for_type_reference(ex))
                            for idx, ex in enumerate(item_type.set_)
                        ]
                    ),
                ),
                optional=lambda item_type: self._generate_type_expectations_for_type_reference(item_type.optional)
                if item_type.optional is not None
                else None,
                nullable=lambda item_type: self._generate_type_expectations_for_type_reference(item_type.nullable)
                if item_type.nullable is not None
                else None,
                map_=lambda map_type: (
                    "dict",
                    dict(
                        [
                            (
                                idx,
                                (
                                    self._generate_type_expectations_for_type_reference(ex.key),
                                    self._generate_type_expectations_for_type_reference(ex.value),
                                ),
                            )
                            for idx, ex in enumerate(map_type.map_)
                        ]
                    ),
                ),
                literal=lambda _: None,
            ),
            named=lambda named: named.shape.visit(
                alias=lambda alias: self._generate_type_expectations_for_type_reference(alias.value),
                enum=lambda _: "string",  # Enums are strings
                object=lambda obj: dict(
                    [
                        (prop.name.wire_value, self._generate_type_expectations_for_type_reference(prop.value))
                        for prop in obj.properties
                    ]
                ),
                union=lambda _: "no_validate",  # Unions are complex, skip validation
                undiscriminated_union=lambda union: self._generate_type_expectations_for_type_reference(
                    union.single_union_type
                ),
            ),
            unknown=lambda _: None,
        )

    def _generate_expected_json_for_type_reference(self, reference: ir_types.ExampleTypeReference) -> object:
        """Generate expected JSON values for strict validation."""
        return reference.shape.visit(
            primitive=lambda primitive: primitive.visit(
                integer=lambda val: val,
                double=lambda val: val,
                uint=lambda val: val,
                uint_64=lambda val: val,
                float_=lambda val: val,
                base_64=lambda val: val,
                big_integer=lambda val: val,
                string=lambda val: val.original,  # EscapedString has .original attribute
                boolean=lambda val: val,
                long_=lambda val: val,
                datetime=lambda val: val.datetime.isoformat()
                if hasattr(val.datetime, "isoformat")
                else str(val.datetime),
                date=lambda val: val.isoformat() if hasattr(val, "isoformat") else str(val),
                uuid_=lambda val: str(val),
            ),
            container=lambda container: container.visit(
                list_=lambda item_type: [self._generate_expected_json_for_type_reference(ex) for ex in item_type.list_],
                set_=lambda item_type: [self._generate_expected_json_for_type_reference(ex) for ex in item_type.set_],
                optional=lambda item_type: self._generate_expected_json_for_type_reference(item_type.optional)
                if item_type.optional is not None
                else None,
                nullable=lambda item_type: self._generate_expected_json_for_type_reference(item_type.nullable)
                if item_type.nullable is not None
                else None,
                map_=lambda map_type: {
                    self._generate_expected_json_for_type_reference(
                        ex.key
                    ): self._generate_expected_json_for_type_reference(ex.value)
                    for ex in map_type.map_
                },
                literal=lambda lit: lit.literal.visit(
                    string=lambda s: s,
                    boolean=lambda b: b,
                ),
            ),
            named=lambda named: named.shape.visit(
                alias=lambda alias: self._generate_expected_json_for_type_reference(alias.value),
                enum=lambda enum: enum.value.wire_value,
                object=lambda obj: {
                    prop.name.wire_value: self._generate_expected_json_for_type_reference(prop.value)
                    for prop in obj.properties
                },
                union=lambda union: None,  # Unions are complex, skip for now
                undiscriminated_union=lambda union: self._generate_expected_json_for_type_reference(
                    union.single_union_type
                ),
            ),
            unknown=lambda unknown: unknown.unknown if hasattr(unknown, "unknown") else unknown,
        )

    def _smoke_test_body(
        self,
        sync_expression: Optional[AST.Expression],
        async_expression: Optional[AST.Expression],
        example_response: Optional[ir_types.ExampleResponse],
        endpoint: ir_types.HttpEndpoint,
        use_structural_validation: bool,
        use_strict_validation: bool,
    ) -> AST.CodeWriter:
        type_expectation_name = "expected_types"
        expected_response_name = "expected_response"
        response_name = "response"
        async_response_name = "async_response"

        response_body = self._maybe_get_response_body(example_response)

        def writer(writer: AST.NodeWriter) -> None:
            # Generate type expectations for structural validation
            if response_body is not None and use_structural_validation:
                expectations = self._generate_type_expectations_for_type_reference(response_body)
                maybe_stringify_expectations = f"'{expectations}'" if type(expectations) is str else expectations

                writer.write(f"{type_expectation_name}: ")
                writer.write_node(AST.Expression(AST.TypeHint.any()))
                writer.write_line(f" = {maybe_stringify_expectations}")
                writer.write_newline_if_last_line_not()

            # Generate expected response for strict validation
            if response_body is not None and use_strict_validation:
                expected_json = self._generate_expected_json_for_type_reference(response_body)
                writer.write(f"{expected_response_name}: ")
                writer.write_node(AST.Expression(AST.TypeHint.any()))
                writer.write_line(f" = {repr(expected_json)}")
                writer.write_newline_if_last_line_not()

            # Sync client test
            if sync_expression:
                writer.write(f"{response_name} = ")
                writer.write_node(sync_expression)
                writer.write_newline_if_last_line_not()

                if response_body is not None and use_strict_validation:
                    # Use strict validation (validates exact values)
                    writer.write_node(
                        self._validate_strict(
                            AST.Expression(response_name),
                            AST.Expression(expected_response_name),
                        )
                    )
                elif response_body is not None and use_structural_validation:
                    # Use structural validation (validates types/structure only)
                    writer.write_node(
                        self._validate_structure(
                            AST.Expression(response_name),
                            AST.Expression(type_expectation_name),
                        )
                    )
                else:
                    # Status-only: just assert the response is not None (basic smoke test)
                    writer.write_line(f"assert {response_name} is not None")

                if async_expression:
                    writer.write_line("\n\n")

            # Async client test
            if async_expression:
                writer.write(f"{async_response_name} = ")
                writer.write_node(async_expression)
                writer.write_newline_if_last_line_not()

                if response_body is not None and use_strict_validation:
                    # Use strict validation (validates exact values)
                    writer.write_node(
                        self._validate_strict(
                            AST.Expression(async_response_name),
                            AST.Expression(expected_response_name),
                        )
                    )
                elif response_body is not None and use_structural_validation:
                    # Use structural validation (validates types/structure only)
                    writer.write_node(
                        self._validate_structure(
                            AST.Expression(async_response_name),
                            AST.Expression(type_expectation_name),
                        )
                    )
                else:
                    # Status-only: just assert the response is not None (basic smoke test)
                    writer.write_line(f"assert {async_response_name} is not None")

            writer.write_newline_if_last_line_not()

        return AST.CodeWriter(writer)

    def _maybe_get_response_body(
        self, example_response: Optional[ir_types.ExampleResponse]
    ) -> Optional[ir_types.ExampleTypeReference]:
        return (
            example_response.visit(
                ok=lambda res: res.visit(
                    body=lambda body: body if body else None, stream=lambda _: None, sse=lambda _: None
                ),
                error=lambda _: None,
            )
            if example_response
            else None
        )

    def _client_snippet(self, is_async: bool, package_path: str, function_invocation: AST.Expression) -> AST.Expression:
        def client_writer(writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write("await ")
            writer.write(f"{self.ASYNC_CLIENT_FIXTURE_NAME if is_async else self.SYNC_CLIENT_FIXTURE_NAME}.")
            writer.write(package_path)
            writer.write_node(function_invocation)

        return AST.Expression(AST.CodeWriter(client_writer))

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

    def _get_service_name(self, fern_filepath: ir_types.FernFilepath) -> str:
        """Get a human-readable service name for filtering."""
        components = fern_filepath.package_path.copy()
        if fern_filepath.file is not None:
            components += [fern_filepath.file]
        if len(components) == 0:
            return "Root"
        return ".".join([component.pascal_case.safe_name for component in components])

    def _generate_service_test(self, service: ir_types.HttpService, snippet_writer: SnippetWriter) -> None:
        fern_filepath = service.name.fern_filepath
        filepath = self._get_filepath_for_fern_filepath(fern_filepath)
        package_path = self._get_subpackage_client_accessor(fern_filepath)
        service_name = self._get_service_name(fern_filepath)

        source_file = self._service_test_files.get(filepath)

        for endpoint in service.endpoints:
            # Skip certain endpoint types that don't work well with smoke tests
            if (
                endpoint.idempotent
                or endpoint.pagination is not None
                or (
                    endpoint.response is not None
                    and endpoint.response.body
                    and (
                        endpoint.response.body.get_as_union().type == "streaming"
                        or endpoint.response.body.get_as_union().type == "fileDownload"
                    )
                )
                or (
                    endpoint.request_body is not None
                    and (
                        endpoint.request_body.get_as_union().type == "fileUpload"
                        or endpoint.request_body.get_as_union().type == "bytes"
                    )
                )
                or (
                    endpoint.response is not None
                    and endpoint.response.body
                    and (
                        endpoint.response.body.get_as_union().type == "json"
                        and hasattr(endpoint.response.body.get_as_union(), "value")
                        and endpoint.response.body.get_as_union().value.get_as_union().type  # type: ignore
                        == "nestedPropertyAsResponse"
                    )
                )
            ):
                continue

            endpoint_name = endpoint.name.snake_case.safe_name

            # Only use user-specified examples for smoke tests (not autogenerated)
            examples = [ex.example for ex in endpoint.user_specified_examples if ex.example is not None]

            # Filter examples based on include/exclude configuration
            filtered_examples = []
            for ex in examples:
                example_name = ex.name.original_name if ex.name else None
                if self._should_include_example(service_name, endpoint_name, example_name):
                    filtered_examples.append(ex)

            if len(filtered_examples) == 0:
                continue

            # Generate a test for each included example
            for example_idx, example in enumerate(filtered_examples):
                example_name = example.name.original_name if example.name else None
                test_suffix = (
                    f"_{example_name}" if example_name else (f"_{example_idx}" if len(filtered_examples) > 1 else "")
                )

                _path_parameter_names = dict()
                for path_parameter in endpoint.all_path_parameters:
                    _path_parameter_names[path_parameter.name] = path_parameter.name.snake_case.safe_name

                endpoint_snippet = self._function_generator(
                    snippet_writer=snippet_writer,
                    service=service,
                    endpoint=endpoint,
                ).generate_endpoint_snippet_raw(example=example)

                sync_snippet = self._client_snippet(False, package_path, endpoint_snippet)
                async_snippet = self._client_snippet(True, package_path, endpoint_snippet)

                if async_snippet is None and sync_snippet is None:
                    continue

                response = ir_types.ExampleResponse.visit(
                    example.response,
                    ok=lambda _: example.response,
                    error=lambda _: None,
                )

                # Determine validation modes for this example
                use_structural = self._should_structural_validate(service_name, endpoint_name, example_name)
                use_strict = self._should_strict_validate(service_name, endpoint_name, example_name)

                # Add functions to a test function
                function_declaration = AST.FunctionDeclaration(
                    name=f"test_{endpoint_name}_smoke{test_suffix}",
                    is_async=True,
                    signature=AST.FunctionSignature(
                        parameters=[
                            AST.FunctionParameter(
                                name=self.SYNC_CLIENT_FIXTURE_NAME,
                                type_hint=AST.TypeHint(self._generated_root_client.sync_client.class_reference),
                            ),
                            AST.FunctionParameter(
                                name=self.ASYNC_CLIENT_FIXTURE_NAME,
                                type_hint=AST.TypeHint(self._generated_root_client.async_client.class_reference),
                            ),
                        ],
                        named_parameters=[],
                        return_type=AST.TypeHint.none(),
                    ),
                    body=self._smoke_test_body(
                        sync_snippet,
                        async_snippet,
                        response,
                        endpoint,
                        use_structural,
                        use_strict,
                    ),
                )

                # At least one endpoint has a snippet, now make the file
                source_file = source_file or self._context.source_file_factory.create(
                    project=self._project,
                    filepath=filepath,
                    generator_exec_wrapper=self._generator_exec_wrapper,
                    from_src=False,
                )
                # Add function to file
                source_file.add_expression(AST.Expression(function_declaration))

        if source_file:
            self._service_test_files[filepath] = source_file

    def _function_generator(
        self, service: ir_types.HttpService, endpoint: ir_types.HttpEndpoint, snippet_writer: SnippetWriter
    ) -> EndpointFunctionGenerator:
        return EndpointFunctionGenerator(
            context=self._context,
            service=service,
            endpoint=endpoint,
            idempotency_headers=[],
            client_wrapper_member_name="client",
            generated_root_client=self._generated_root_client,
            snippet_writer=snippet_writer,
            package=ir_types.Package(
                fern_filepath=service.name.fern_filepath,
                types=[],
                errors=[],
                subpackages=[],
                has_endpoints_in_tree=True,
            ),
            is_async=False,
            endpoint_metadata_collector=None,
        )

    def _write_test_files(self) -> None:
        for filepath, test_file in self._service_test_files.items():
            self._project.write_source_file(source_file=test_file, filepath=filepath, include_src_root=False)

    def _copy_utilities_to_project(self) -> None:
        utilities_filepath = Filepath(
            directories=(self._test_base_path, self._smoke_test_path),
            file=Filepath.FilepathPart(module_name="utilities"),
        )

        source = (
            os.path.join(os.path.dirname(__file__), "../../../core_utilities/sdk")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileFactory.add_source_file_from_disk(
            project=self._project,
            path_on_disk=os.path.join(source, "smoke_test_utilities.py"),
            filepath_in_project=utilities_filepath,
            exports={"validate_smoke_test_response", "validate_strict_response"},
            include_src_root=False,
        )

    def _validate_structure(
        self,
        response_expression: AST.Expression,
        expected_types_expression: AST.Expression,
    ) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(
                            self._test_base_path.module_name, self._smoke_test_path.module_name, "utilities"
                        ),
                        named_import="validate_smoke_test_response",
                    ),
                ),
                args=[response_expression, expected_types_expression],
            )
        )

    def _validate_strict(
        self,
        response_expression: AST.Expression,
        expected_response_expression: AST.Expression,
    ) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(
                            self._test_base_path.module_name, self._smoke_test_path.module_name, "utilities"
                        ),
                        named_import="validate_strict_response",
                    ),
                ),
                args=[response_expression, expected_response_expression],
            )
        )

    def generate(self, ir: ir_types.IntermediateRepresentation, snippet_writer: SnippetWriter) -> None:
        """Generate smoke tests for all services."""
        self._copy_utilities_to_project()
        self._generate_client_fixture()

        for service in ir.services.values():
            self._generate_service_test(service=service, snippet_writer=snippet_writer)

        self._write_test_files()
