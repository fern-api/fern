import os
from typing import Any, Dict, Optional, Tuple, Union

import fern.ir.resources as ir_types

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
    EndpointFunctionSnippetGenerator,
)
from fern_python.generators.sdk.client_generator.generated_root_client import (
    GeneratedRootClient,
    RootClient,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    MultipleBaseUrlsEnvironmentGenerator,
)
from fern_python.generators.sdk.environment_generators.single_base_url_environment_generator import (
    SingleBaseUrlEnvironmentGenerator,
)
from fern_python.snippet.snippet_writer import SnippetWriter
from fern_python.source_file_factory.source_file_factory import SourceFileFactory


class SnippetTestFactory:
    SYNC_CLIENT_FIXTURE_NAME = "client"
    ASYNC_CLIENT_FIXTURE_NAME = "async_client"
    ENVVAR_PREFIX = "ENV_"
    TEST_URL_ENVVAR = "TESTS_BASE_URL"

    def __init__(
        self,
        project: Project,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        generated_root_client: GeneratedRootClient,
        generated_environment: Optional[Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator]],
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

        self._test_base_path = Filepath.DirectoryFilepathPart(
            module_name="tests",
        )

        self._service_test_files: Dict[Filepath, SourceFile] = dict()

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

    def _enviroment(self, generated_environment: MultipleBaseUrlsEnvironmentGenerator) -> AST.ClassInstantiation:
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
            if param.constructor_parameter_name != "base_url" and param.constructor_parameter_name != "environment"
        ]
        if self._generated_environment is None:
            non_url_params.append(self._write_envvar_parameter("base_url", self.TEST_URL_ENVVAR, "base_url"))
        return AST.ClassInstantiation(
            class_=client.class_reference,
            # TODO: how can we do this in a more connected + typesafe way
            args=non_url_params,
            kwargs=[
                (
                    "environment",
                    AST.Expression(self._enviroment(self._generated_environment)),
                )
            ]
            if self._generated_environment is not None
            else None,
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

        source_file = SourceFileFactory.create(
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
                    module_name=pathpart.snake_case.unsafe_name,
                ),
            )

        module_name = fern_filepath.file.snake_case.unsafe_name if fern_filepath.file is not None else "root"
        return Filepath(
            directories=directories,
            file=Filepath.FilepathPart(module_name=f"test_{module_name}"),
        )

    def _test_body(
        self, sync_expression: Optional[AST.Expression], async_expression: Optional[AST.Expression], response_json: Any
    ) -> AST.CodeWriter:
        expectation_name = "expected_response"
        response_name = "response"
        async_response_name = "async_response"

        def writer(writer: AST.NodeWriter) -> None:
            if response_json is not None:
                maybe_stringify_response_json = f"'{response_json}'" if type(response_json) is str else response_json
                writer.write_line(f"{expectation_name} = {maybe_stringify_response_json}")
            if sync_expression:
                if response_json is not None:
                    writer.write(f"{response_name} = ")
                    writer.write_node(sync_expression)
                    writer.write_newline_if_last_line_not()
                    writer.write_node(
                        self._validate_response(AST.Expression(response_name), AST.Expression(expectation_name))
                    )
                else:
                    writer.write_line(
                        f"# Type ignore to avoid mypy complaining about the function not being meant to return a value"
                    )
                    writer.write(f"assert ")
                    writer.write_node(sync_expression)
                    writer.write(f" is None  # type: ignore[func-returns-value]")
                if async_expression:
                    writer.write_line("\n\n")
            if async_expression:
                if response_json is not None:
                    writer.write(f"{async_response_name} = ")
                    writer.write_node(async_expression)
                    writer.write_newline_if_last_line_not()
                    writer.write_node(
                        self._validate_response(AST.Expression(async_response_name), AST.Expression(expectation_name))
                    )
                else:
                    if sync_expression is None:
                        writer.write_line(
                            f"# Type ignore to avoid mypy complaining about the function not being meant to return a value"
                        )
                    writer.write(f"assert ")
                    writer.write_node(async_expression)
                    writer.write(f" is None  # type: ignore[func-returns-value]")
            writer.write_newline_if_last_line_not()

        return AST.CodeWriter(writer)

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
        return ".".join([component.snake_case.unsafe_name for component in components]) + "."

    def _generate_service_test(self, service: ir_types.HttpService, snippet_writer: SnippetWriter) -> None:
        fern_filepath = service.name.fern_filepath
        filepath = self._get_filepath_for_fern_filepath(fern_filepath)
        package_path = self._get_subpackage_client_accessor(fern_filepath)

        source_file = self._service_test_files.get(filepath)

        for endpoint in service.endpoints:
            if (
                endpoint.idempotent
                or endpoint.pagination is not None
                or (
                    endpoint.response is not None
                    and (
                        endpoint.response.get_as_union().type == "streaming"
                        or endpoint.response.get_as_union().type == "fileDownload"
                    )
                )
                or (
                    endpoint.request_body is not None
                    and (
                        endpoint.request_body.get_as_union().type == "fileUpload"
                        or endpoint.request_body.get_as_union().type == "bytes"
                    )
                )
            ):
                continue
            endpoint_name = endpoint.name.get_as_name().snake_case.unsafe_name

            # TODO: We should make the mock server return the specified error response
            # if we want to test that as well, then we can test each example, but that seems less pressing.
            successful_examples = list(
                filter(
                    lambda ex: ir_types.ExampleResponse.visit(
                        ex.get_as_union().response,
                        ok=lambda _: True,
                        error=lambda _: False,
                    ),
                    endpoint.examples,
                )
            )
            if len(successful_examples) == 0:
                continue

            example: ir_types.ExampleEndpointCall = successful_examples[0]
            endpoint_snippet = EndpointFunctionSnippetGenerator(
                context=self._context,
                snippet_writer=snippet_writer,
                service=service,
                endpoint=endpoint,
                example=example,
            ).generate_snippet()

            sync_snippet = self._client_snippet(False, package_path, endpoint_snippet)
            async_snippet = self._client_snippet(True, package_path, endpoint_snippet)

            if async_snippet is None and sync_snippet is None:
                continue

            response = ir_types.ExampleResponse.visit(
                example.get_as_union().response,
                ok=lambda ok_example: ok_example,
                error=lambda _: None,
            )
            # Add functions to a test function
            function_declaration = AST.FunctionDeclaration(
                name=f"test_{endpoint_name}",
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
                    response.body.json_example if response is not None and response.body is not None else None,
                ),
            )

            # At least one endpoint has a snippet, now make the file
            source_file = source_file or SourceFileFactory.create(
                project=self._project,
                filepath=filepath,
                generator_exec_wrapper=self._generator_exec_wrapper,
                from_src=False,
            )
            # Add function to file
            source_file.add_expression(AST.Expression(function_declaration))

        if source_file:
            self._service_test_files[filepath] = source_file

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
        self, response_expression: AST.Expression, expected_expression: AST.Expression
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
                args=[response_expression, expected_expression],
            )
        )

    def tests(self, ir: ir_types.IntermediateRepresentation, snippet_writer: SnippetWriter) -> None:
        self._copy_utilities_to_project()
        self._generate_client_fixture()

        for service in ir.services.values():
            self._generate_service_test(service=service, snippet_writer=snippet_writer)

        self._write_test_files()
