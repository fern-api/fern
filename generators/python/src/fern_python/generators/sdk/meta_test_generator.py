from typing import Dict, List, Set

from fern_python.codegen import AST, Project
from fern_python.codegen.filepath import Filepath
from fern_python.generator_exec_wrapper.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.sdk.client_generator.generated_root_client import GeneratedRootClient
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

import fern.ir.resources as ir_types


class MetaTestGenerator:
    def __init__(
        self,
        *,
        project: Project,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        generated_root_client: GeneratedRootClient,
        ir: ir_types.IntermediateRepresentation,
    ):
        self._project = project
        self._context = context
        self._generator_exec_wrapper = generator_exec_wrapper
        self._generated_root_client = generated_root_client
        self._ir = ir

    def generate(self) -> None:
        subpackage_clients = self._collect_subpackage_clients()

        if not subpackage_clients:
            return

        self._generate_client_test(subpackage_clients)

    def _collect_subpackage_clients(self) -> Dict[str, List[str]]:
        subpackage_clients: Dict[str, List[str]] = {}

        root_clients: List[str] = []
        for subpackage_id in self._ir.subpackages.keys():
            subpackage = self._ir.subpackages[subpackage_id]
            if subpackage.has_endpoints_in_tree:
                fern_filepath = subpackage.fern_filepath
                client_property_name = self._get_client_property_name(fern_filepath)

                if len(fern_filepath.package_path) == 0 and (
                    fern_filepath.file is None or fern_filepath.file.snake_case.safe_name == ""
                ):
                    root_clients.append(client_property_name)
                else:
                    parent_path = self._get_parent_path(fern_filepath)
                    if parent_path not in subpackage_clients:
                        subpackage_clients[parent_path] = []
                    subpackage_clients[parent_path].append(client_property_name)

        if root_clients:
            subpackage_clients[""] = root_clients

        return subpackage_clients

    def _get_client_property_name(self, fern_filepath: ir_types.FernFilepath) -> str:
        components = fern_filepath.package_path.copy()
        if fern_filepath.file is not None:
            components += [fern_filepath.file]

        if len(components) == 0:
            return ""

        if len(components) == 1:
            return components[0].snake_case.safe_name

        return components[-1].snake_case.safe_name

    def _get_parent_path(self, fern_filepath: ir_types.FernFilepath) -> str:
        components = fern_filepath.package_path.copy()
        if fern_filepath.file is not None:
            components += [fern_filepath.file]

        if len(components) <= 1:
            return ""

        return ".".join([component.snake_case.safe_name for component in components[:-1]])

    def _generate_client_test(self, subpackage_clients: Dict[str, List[str]]) -> None:
        filepath = Filepath(
            directories=(
                Filepath.DirectoryFilepathPart(module_name="tests"),
                Filepath.DirectoryFilepathPart(module_name="meta"),
            ),
            file=Filepath.FilepathPart(module_name="test_client"),
        )

        source_file = self._context.source_file_factory.create(
            project=self._project,
            filepath=filepath,
            generator_exec_wrapper=self._generator_exec_wrapper,
            from_src=False,
        )

        root_clients = subpackage_clients.get("", [])

        test_function = self._create_test_function(
            root_clients=root_clients,
            subpackage_clients=subpackage_clients,
        )

        source_file.add_expression(AST.Expression(test_function))

        self._project.write_source_file(
            source_file=source_file,
            filepath=filepath,
            include_src_root=False,
        )

    def _create_test_function(
        self,
        root_clients: List[str],
        subpackage_clients: Dict[str, List[str]],
    ) -> AST.FunctionDeclaration:
        def write_test_body(writer: AST.NodeWriter) -> None:
            writer.write_line("import typing as _t")
            writer.write_newline_if_last_line_not()
            writer.write_line("try:")
            writer.write("    client = _t.cast(_t.Any, ")
            writer.write_node(
                AST.Expression(self._generated_root_client.sync_client.class_reference)
            )
            writer.write(')(base_url="https://api.example.com")')
            writer.write_newline_if_last_line_not()
            writer.write_line("except Exception:")
            writer.write_line("    return")
            writer.write_newline_if_last_line_not()

            all_client_paths = self._get_all_client_paths(root_clients, subpackage_clients)

            for client_path in sorted(all_client_paths):
                if client_path:
                    writer.write_line(f"assert client.{client_path} is not None")

        return AST.FunctionDeclaration(
            name="test_client_can_access_all_subclients",
            signature=AST.FunctionSignature(
                parameters=[],
                named_parameters=[],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(write_test_body),
        )

    def _get_all_client_paths(
        self,
        root_clients: List[str],
        subpackage_clients: Dict[str, List[str]],
    ) -> Set[str]:
        all_paths: Set[str] = set()

        for client in root_clients:
            all_paths.add(client)
            self._collect_nested_paths(client, subpackage_clients, all_paths)

        return all_paths

    def _collect_nested_paths(
        self,
        current_path: str,
        subpackage_clients: Dict[str, List[str]],
        all_paths: Set[str],
    ) -> None:
        if current_path in subpackage_clients:
            for nested_client in subpackage_clients[current_path]:
                nested_path = f"{current_path}.{nested_client}"
                all_paths.add(nested_path)
                self._collect_nested_paths(nested_path, subpackage_clients, all_paths)
