import os
from typing import Any, Dict, Optional, Set, Tuple, Union

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
from fern_python.generators.sdk.custom_config import WireTestValidationConfig
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    MultipleBaseUrlsEnvironmentGenerator,
)
from fern_python.generators.sdk.environment_generators.single_base_url_environment_generator import (
    SingleBaseUrlEnvironmentGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.source_file_factory.source_file_factory import SourceFileFactory

import fern.ir.resources as ir_types


class SnippetTestFactory:
    SYNC_CLIENT_FIXTURE_NAME = "client"
    ASYNC_CLIENT_FIXTURE_NAME = "async_client"
    ENVVAR_PREFIX = "ENV_"
    TEST_URL_ENVVAR = "TESTS_BASE_URL"
    WIRE_TEST_VALIDATION_ENVVAR = "WIRE_TEST_VALIDATION"

    def __init__(
        self,
        project: Project,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        generated_root_client: GeneratedRootClient,
        generated_environment: Optional[Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator]],
        wire_test_validation_config: Optional[WireTestValidationConfig] = None,
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
        self._wire_test_validation_config = wire_test_validation_config

        self._test_base_path = Filepath.DirectoryFilepathPart(
            module_name="tests",
        )

        self._service_test_files: Dict[Filepath, SourceFile] = dict()

        # Parse validation patterns if config is provided
        self._structural_include_patterns: Optional[Set[str]] = None
        self._structural_exclude_patterns: Set[str] = set()
        self._strict_include_patterns: Optional[Set[str]] = None
        self._strict_exclude_patterns: Set[str] = set()

        if wire_test_validation_config is not None:
            # Parse structural validation patterns
            if wire_test_validation_config.structural_validation.include_examples is not None:
                self._structural_include_patterns = set(
                    wire_test_validation_config.structural_validation.include_examples
                )
            if wire_test_validation_config.structural_validation.exclude_examples:
                self._structural_exclude_patterns = set(
                    wire_test_validation_config.structural_validation.exclude_examples
                )

            # Parse strict validation patterns
            if wire_test_validation_config.strict_validation.include_examples is not None:
                self._strict_include_patterns = set(wire_test_validation_config.strict_validation.include_examples)
            if wire_test_validation_config.strict_validation.exclude_examples:
                self._strict_exclude_patterns = set(wire_test_validation_config.strict_validation.exclude_examples)

    def _get_service_name(self, service: ir_types.HttpService) -> str:
        """Get a human-readable service name for pattern matching."""
        fern_filepath = service.name.fern_filepath
        if fern_filepath.file is not None:
            return fern_filepath.file.pascal_case.safe_name
        if len(fern_filepath.package_path) > 0:
            return fern_filepath.package_path[-1].pascal_case.safe_name
        return "Root"

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
        if self._wire_test_validation_config is None:
            return False

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
        if self._wire_test_validation_config is None:
            return False

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
        args = [AST.Expression(f'"{self.TEST_URL_ENVVAR}"'), AST.Expression('"base_url"')]
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
        non_url_params = [
            self._write_envvar_parameter(
                param.constructor_parameter_name,
                self.ENVVAR_PREFIX + param.constructor_parameter_name.upper(),
                param.constructor_parameter_name,
            )
            for param in client.parameters
            if param.constructor_parameter_name != "base_url"
            and param.constructor_parameter_name != "environment"
            and param.constructor_parameter_name != "_token_getter_override"
        ]

        _kwargs = []
        param_names = [param.constructor_parameter_name for param in client.parameters]
        if "_token_getter_override" in param_names:
            _kwargs.append(
                (
                    "_token_getter_override",
                    AST.Expression('lambda: os.getenv("ENV_TOKEN", "token")'),
                )
            )

        if self._generated_environment is None:
            non_url_params.append(self._write_envvar_parameter("base_url", self.TEST_URL_ENVVAR, "base_url"))
        else:
            _kwargs.append(
                (
                    "environment",
                    AST.Expression(self._environment(self._generated_environment)),
                )
            )

        return AST.ClassInstantiation(
            class_=client.class_reference,
            # TODO: how can we do this in a more connected + typesafe way
            args=non_url_params,
            kwargs=_kwargs,
        )

    def _generate_client_fixture(self) -> None:
        # Note the conftest name is important, and required to make these fixtures available to all tests
        utilities_filepath = Filepath(
            directories=(
                Filepath.DirectoryFilepathPart(
                    module_name="tests",
                ),
            ),
            file=Filepath.FilepathPart(module_name="conftest"),
        )

        source_file = self._context.source_file_factory.create(
            project=self._project,
            filepath=utilities_filepath,
            generator_exec_wrapper=self._generator_exec_wrapper,
            from_src=False,
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
        # Maybe add `validate_json` function to this file as an assertion utility

        self._project.write_source_file(source_file=source_file, filepath=utilities_filepath, include_src_root=False)

    def _get_filepath_for_fern_filepath(self, fern_filepath: ir_types.FernFilepath) -> Filepath:
        directories: Tuple[Filepath.DirectoryFilepathPart, ...] = (
            Filepath.DirectoryFilepathPart(
                module_name="tests",
            ),
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
            file=Filepath.FilepathPart(module_name=f"test_{module_name}"),
        )

    # Icky icky
    def _generate_type_expectations_for_type_reference(self, reference: ir_types.ExampleTypeReference) -> Any:
        return reference.shape.visit(
            primitive=lambda primitive: primitive.visit(
                integer=lambda _: "integer",
                double=lambda _: None,
                uint=lambda _: None,
                uint_64=lambda _: None,
                float_=lambda _: None,
                base_64=lambda _: None,
                big_integer=lambda _: None,
                string=lambda _: None,
                boolean=lambda _: None,
                long_=lambda _: None,
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
                enum=lambda _: None,
                object=lambda obj: dict(
                    [
                        (prop.name.wire_value, self._generate_type_expectations_for_type_reference(prop.value))
                        for prop in obj.properties
                    ]
                ),
                # HACK(FER-1172): we don't store the base union information in our examples, outside of the JSON example, so you can't really parse through
                # those properties as you would the other properties of the union. Note this applies to discriminated unions only.
                union=lambda _: "no_validate",
                undiscriminated_union=lambda union: self._generate_type_expectations_for_type_reference(
                    union.single_union_type
                ),
            ),
            unknown=lambda _: None,
        )

    def _test_body(
        self,
        sync_expression: Optional[AST.Expression],
        async_expression: Optional[AST.Expression],
        example_response: Optional[ir_types.ExampleResponse],
        endpoint: ir_types.HttpEndpoint,
        do_structural_validation: bool = False,
        do_strict_validation: bool = False,
    ) -> AST.CodeWriter:
        expectation_name = "expected_response"
        type_expectation_name = "expected_types"
        response_name = "response"
        async_response_name = "async_response"

        response_body = self.maybe_get_response_body(example_response)
        response_json = response_body.json_example if response_body is not None else None

        # Determine if we should use the new validation modes or the existing behavior
        use_new_validation = do_structural_validation or do_strict_validation

        def writer(writer: AST.NodeWriter) -> None:
            if response_json is not None:
                maybe_stringify_response_json = repr(response_json) if type(response_json) is str else response_json

                writer.write(f"{expectation_name}: ")
                writer.write_node(AST.Expression(AST.TypeHint.any()))
                writer.write_line(f" = {maybe_stringify_response_json}")

                expectations = (
                    self._generate_type_expectations_for_type_reference(response_body)
                    if response_body is not None
                    else None
                )
                maybe_stringify_expectations = f"'{expectations}'" if type(expectations) is str else expectations

                writer.write(f"{type_expectation_name}: ")
                writer.write_node(
                    AST.Expression(AST.TypeHint.tuple_(AST.TypeHint.any(), AST.TypeHint.any()))
                    if isinstance(expectations, tuple)
                    else AST.Expression(AST.TypeHint.any())
                )
                writer.write_line(f" = {maybe_stringify_expectations}")
            if sync_expression:
                if response_json is not None:
                    writer.write(f"{response_name} = ")
                    writer.write_node(sync_expression)
                    writer.write_newline_if_last_line_not()

                    if use_new_validation:
                        # Use new validation with runtime env var control
                        writer.write_line(f'if os.getenv("{self.WIRE_TEST_VALIDATION_ENVVAR}", "on").lower() != "off":')
                        with writer.indent():
                            if do_strict_validation:
                                writer.write_node(
                                    self._validate_response(
                                        AST.Expression(response_name),
                                        AST.Expression(expectation_name),
                                        AST.Expression(type_expectation_name),
                                    )
                                )
                            elif do_structural_validation:
                                writer.write_node(
                                    self._validate_response(
                                        AST.Expression(response_name),
                                        AST.Expression(expectation_name),
                                        AST.Expression(type_expectation_name),
                                    )
                                )
                    else:
                        # Use existing validation behavior
                        writer.write_node(
                            self._validate_response(
                                AST.Expression(response_name),
                                AST.Expression(expectation_name),
                                AST.Expression(type_expectation_name),
                            )
                        )
                else:
                    writer.write_line(
                        "# Type ignore to avoid mypy complaining about the function not being meant to return a value"
                    )
                    writer.write("assert (")
                    with writer.indent():
                        writer.write_node(sync_expression)
                        writer.write(" # type: ignore[func-returns-value]")
                    writer.write_newline_if_last_line_not()
                    if (
                        endpoint.response is not None
                        and endpoint.response.body is not None
                        and endpoint.response.body.get_as_union().type == "text"
                    ):
                        # HttpX returns an empty string for text responses that are empty/no content
                        writer.write(" == ''")
                    else:
                        writer.write(" is None")
                    writer.write_line(")")
                if async_expression:
                    writer.write_line("\n\n")
            if async_expression:
                if response_json is not None:
                    writer.write(f"{async_response_name} = ")
                    writer.write_node(async_expression)
                    writer.write_newline_if_last_line_not()

                    if use_new_validation:
                        # Use new validation with runtime env var control
                        writer.write_line(f'if os.getenv("{self.WIRE_TEST_VALIDATION_ENVVAR}", "on").lower() != "off":')
                        with writer.indent():
                            if do_strict_validation:
                                writer.write_node(
                                    self._validate_response(
                                        AST.Expression(async_response_name),
                                        AST.Expression(expectation_name),
                                        AST.Expression(type_expectation_name),
                                    )
                                )
                            elif do_structural_validation:
                                writer.write_node(
                                    self._validate_response(
                                        AST.Expression(async_response_name),
                                        AST.Expression(expectation_name),
                                        AST.Expression(type_expectation_name),
                                    )
                                )
                    else:
                        # Use existing validation behavior
                        writer.write_node(
                            self._validate_response(
                                AST.Expression(async_response_name),
                                AST.Expression(expectation_name),
                                AST.Expression(type_expectation_name),
                            )
                        )
                else:
                    if sync_expression is None:
                        writer.write_line(
                            "# Type ignore to avoid mypy complaining about the function not being meant to return a value"
                        )
                    writer.write("assert (")
                    with writer.indent():
                        writer.write_node(async_expression)
                        writer.write(" # type: ignore[func-returns-value]")
                    writer.write_newline_if_last_line_not()
                    if (
                        endpoint.response is not None
                        and endpoint.response.body is not None
                        and endpoint.response.body.get_as_union().type == "text"
                    ):
                        # HttpX returns an empty string for text responses that are empty/no content
                        writer.write(" == ''")
                    else:
                        writer.write(" is None")
                    writer.write_line(")")
            writer.write_newline_if_last_line_not()

        return AST.CodeWriter(writer)

    def maybe_get_response_body(
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

    # TODO: Stolen from endpoint_function_generator.py, should be shared (and also unified with what actually builds package structure).
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

    def _generate_service_test(self, service: ir_types.HttpService, snippet_writer: SnippetWriter) -> None:
        fern_filepath = service.name.fern_filepath
        filepath = self._get_filepath_for_fern_filepath(fern_filepath)
        package_path = self._get_subpackage_client_accessor(fern_filepath)
        service_name = self._get_service_name(service)

        source_file = self._service_test_files.get(filepath)

        for endpoint in service.endpoints:
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
                # TODO(FER-2852): support test generation for nested property responses
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
            endpoint_pascal_name = endpoint.name.pascal_case.safe_name

            examples = [ex.example for ex in endpoint.user_specified_examples if ex.example is not None]
            if len(endpoint.user_specified_examples) == 0:
                examples = [ex.example for ex in endpoint.autogenerated_examples]
            successful_examples = list(
                filter(
                    lambda ex: ir_types.ExampleResponse.visit(
                        ex.response,
                        ok=lambda _: True,
                        error=lambda _: False,
                    ),
                    examples,
                )
            )

            if successful_examples is None or len(successful_examples) == 0:
                continue

            # Determine which examples to test
            test_all = (
                self._wire_test_validation_config is not None and self._wire_test_validation_config.test_all_examples
            )
            examples_to_test = successful_examples if test_all else [successful_examples[0]]

            for example_idx, example in enumerate(examples_to_test):
                # Get example name for pattern matching
                example_name = example.name.original_name if example.name else None

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
                do_structural = self._should_structural_validate(service_name, endpoint_pascal_name, example_name)
                do_strict = self._should_strict_validate(service_name, endpoint_pascal_name, example_name)

                # Generate test function name (include index if testing multiple examples)
                test_name = f"test_{endpoint_name}"
                if len(examples_to_test) > 1:
                    test_name = f"test_{endpoint_name}_{example_idx}"

                # Add functions to a test function
                function_declaration = AST.FunctionDeclaration(
                    name=test_name,
                    # All tests will have the sync and async instantiation within them
                    is_async=True,
                    signature=AST.FunctionSignature(
                        # Adds in the parameters for the pytest fixtures to be injected in
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
                    body=self._test_body(
                        sync_snippet,
                        async_snippet,
                        response,
                        endpoint,
                        do_structural_validation=do_structural,
                        do_strict_validation=do_strict,
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
            # Package doesn't matter here
            package=ir_types.Package(
                fern_filepath=service.name.fern_filepath,
                types=[],
                errors=[],
                subpackages=[],
                has_endpoints_in_tree=True,
            ),
            # This doesn't matter here either
            is_async=False,
            endpoint_metadata_collector=None,
        )

    def _write_test_files(self) -> None:
        for filepath, test_file in self._service_test_files.items():
            self._project.write_source_file(source_file=test_file, filepath=filepath, include_src_root=False)

    def _copy_utilities_to_project(self) -> None:
        utilities_filepath = Filepath(
            directories=(self._test_base_path,),
            file=Filepath.FilepathPart(module_name="utilities"),
        )

        source = (
            os.path.join(os.path.dirname(__file__), "../../../core_utilities/sdk")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileFactory.add_source_file_from_disk(
            project=self._project,
            path_on_disk=os.path.join(source, "base_test_utilities.py"),
            filepath_in_project=utilities_filepath,
            exports={"validate_response"},
            include_src_root=False,
        )

    def _validate_response(
        self,
        response_expression: AST.Expression,
        expected_expression: AST.Expression,
        expected_types_expression: AST.Expression,
    ) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(self._test_base_path.module_name, "utilities"),
                        named_import="validate_response",
                    ),
                ),
                args=[response_expression, expected_expression, expected_types_expression],
            )
        )

    def tests(self, ir: ir_types.IntermediateRepresentation, snippet_writer: SnippetWriter) -> None:
        self._copy_utilities_to_project()
        self._generate_client_fixture()

        for service in ir.services.values():
            self._generate_service_test(service=service, snippet_writer=snippet_writer)

        self._write_test_files()
