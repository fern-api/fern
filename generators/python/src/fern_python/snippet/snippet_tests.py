from fern_python import generator_exec_wrapper
from fern_python.codegen import AST
from fern_python.codegen import filepath
from fern_python.codegen.ast.nodes.reference_node.reference_node import ReferenceNode
from fern_python.codegen.ast.references.module import Module
from fern_python.codegen.ast.references.reference import Reference, ReferenceImport
from fern_python.codegen.filepath import ExportStrategy, Filepath
from fern_python.codegen.project import Project
from fern_python.codegen.source_file import SourceFile
from fern_python.generator_exec_wrapper.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.sdk.client_generator.generated_root_client import GeneratedRootClient, RootClient
from fern_python.snippet.snippet_endpoint_expression import EndpointExpression
from fern_python.source_file_factory.source_file_factory import SourceFileFactory
import fern.ir.resources as ir_types
from typing import Dict, List, Optional, Tuple

from fern_python.generators.sdk.core_utilities.client_wrapper_generator import ClientWrapperGenerator

class SnippetTestFactory:
    SYNC_CLIENT_FIXTURE_NAME = "client"
    ASYNC_CLIENT_FIXTURE_NAME = "async_client"

    def __init__(
            self,
            project: Project,
            generator_exec_wrapper: GeneratorExecWrapper,
            sync_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression],
            async_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression],
            generated_root_client: GeneratedRootClient
        ) -> None:
        self._project = project
        self._generator_exec_wrapper = generator_exec_wrapper
        self._sync_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression] = sync_endpoint_snippets
        self._async_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression] = async_endpoint_snippets
        self._generated_root_client: GeneratedRootClient = generated_root_client

        self._service_test_files: Dict[Filepath, SourceFile] = dict()

    def _return_expression(self, returned_expression: AST.ClassInstantiation) -> AST.Expression:
        def return_writer(writer: AST.NodeWriter) -> None:
            writer.write("return ")
            writer.write_node(returned_expression)
            writer.write_newline_if_last_line_not()
        return AST.Expression(AST.CodeWriter(return_writer))
    
    def _write_envvar_parameter(self, parameter_name: str, envvar_name: str) -> AST.Expression:
        os_get = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                    qualified_name_excluding_import=("getenv",),
                ),
                args=[AST.Expression(f'"{envvar_name}"')],
            )
        )
        def envvar_writer(writer: AST.NodeWriter) -> None:
            writer.write(f'{parameter_name}=')
            writer.write_node(os_get)
            writer.write_newline_if_last_line_not()
        return AST.Expression(AST.CodeWriter(envvar_writer))

    def instantiate_client(self, client: RootClient) -> AST.ClassInstantiation:
        non_url_params = [param.instantiation for param in client.parameters if param.constructor_parameter_name != "base_url" and param.constructor_parameter_name != "environment"]
        non_url_params.append(self._write_envvar_parameter("base_url", "TESTS_BASE_URL"))
        return AST.ClassInstantiation(
            class_=client.class_reference,
            # TODO: how can we do this in a more connected + typesafe way
            args=non_url_params,
        )

    def generate_client_fixture(self):
        utilities_filepath = Filepath(
            directories=(Filepath.DirectoryFilepathPart(
                module_name="tests",
            ),),
            file=Filepath.FilepathPart(module_name="utilities"),
        )
        source_file = SourceFileFactory.create(
                project=self._project, filepath=utilities_filepath, generator_exec_wrapper=self._generator_exec_wrapper
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
                body=self._return_expression(self.instantiate_client(self._generated_root_client.sync_client)),
            )
        source_file.add_expression(sync_function_declaration)
        
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
                body=self._return_expression(self.instantiate_client(self._generated_root_client.async_client)),
            )
        source_file.add_expression(async_function_declaration)
        # Maybe add `validate_json` function to this file as an assertion utility

        self._project.write_source_file(source_file=source_file, filepath=utilities_filepath)    

    def _get_filepath_for_fern_filepath(self, fern_filepath: ir_types.FernFilepath) -> Filepath:
        directories: Tuple[Filepath.DirectoryFilepathPart, ...] = (
            Filepath.DirectoryFilepathPart(
                module_name="tests",
            ),
        )

        for pathpart in fern_filepath.package_path:
            directories += (Filepath.DirectoryFilepathPart(
                module_name=pathpart.snake_case.unsafe_name,
                export_strategy=ExportStrategy(export_all=True),
            ),)

        module_name = fern_filepath.file.snake_case.unsafe_name if fern_filepath.file is not None else "root"
        return Filepath(
            directories=directories,
            file=Filepath.FilepathPart(module_name=f"test_{module_name}"),
        )
    
    def _test_body(self, sync_expression: Optional[EndpointExpression], async_expression: Optional[EndpointExpression]) -> AST.CodeWriter:
        def writer(writer: AST.NodeWriter) -> None:
            if sync_expression:
                writer.write_node(sync_expression.expr)
            if async_expression:
                writer.write_node(async_expression.expr)
            writer.write_newline_if_last_line_not()
        return AST.CodeWriter(writer)

    def generate_service_test(self, endpoints: List[ir_types.HttpEndpoint], fern_filepath: ir_types.FernFilepath) -> AST.FunctionDeclaration:
        filepath = self._get_filepath_for_fern_filepath(fern_filepath)

        source_file = self._service_test_files.get(filepath)
        
        for endpoint in endpoints:
            endpoint_name = endpoint.name.get_as_name().snake_case.unsafe_name
            sync_snippet = self._sync_endpoint_snippets.get(endpoint.id)
            async_snippet = self._async_endpoint_snippets.get(endpoint.id)

            if async_snippet is None and sync_snippet is None:
                continue

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
                            type_hint=AST.TypeHint(self._generated_root_client.sync_client.class_reference)
                        ),
                        AST.FunctionParameter(
                            name=self.ASYNC_CLIENT_FIXTURE_NAME,
                            type_hint=AST.TypeHint(self._generated_root_client.async_client.class_reference)
                        )
                    ],
                    named_parameters=[],
                    return_type=AST.TypeHint.none(),
                ),
                body=self._test_body(sync_snippet, async_snippet)
            )

            # At least one endpoint has a snippet, now make the file
            source_file = source_file or SourceFileFactory.create(
                project=self._project, filepath=filepath, generator_exec_wrapper=self._generator_exec_wrapper
            )
            # Add function to file
            source_file.add_expression(function_declaration)

        if source_file:
            self._service_test_files[filepath] = source_file

    def write_test_files(self) -> None:
        for filepath, test_file in self._service_test_files.items():
            self._project.write_source_file(source_file=test_file, filepath=filepath)