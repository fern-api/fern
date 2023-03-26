import os
from typing import Optional, Set

from fern_python.codegen import AST, Filepath, Project
from fern_python.source_file_generator import SourceFileGenerator

from ..sdk_filepath_creator import SdkFilepathCreator


class CoreUtilities:
    def __init__(self, filepath_creator: SdkFilepathCreator):
        self.filepath = filepath_creator.generate_filepath_prefix() + (
            Filepath.DirectoryFilepathPart(module_name="core"),
        )
        self._module_path = tuple(part.module_name for part in self.filepath)

    def copy_to_project(self, *, project: Project) -> None:
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="datetime_utils.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="datetime_utils"),
            ),
            exports={"serialize_datetime"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="api_error.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="api_error"),
            ),
            exports={"ApiError"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="jsonable_encoder.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="jsonable_encoder"),
            ),
            exports={"jsonable_encoder"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="remove_none_from_headers.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="remove_none_from_headers"),
            ),
            exports={"remove_none_from_headers"},
        )

    def _copy_file_to_project(
        self, *, project: Project, relative_filepath_on_disk: str, filepath_in_project: Filepath, exports: Set[str]
    ) -> None:
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/sdk")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileGenerator.add_source_file_from_disk(
            project=project,
            path_on_disk=os.path.join(source, relative_filepath_on_disk),
            filepath_in_project=filepath_in_project,
            exports=exports,
        )

    def get_reference_to_api_error(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "api_error"), named_import="ApiError"
            ),
        )

    def instantiate_api_error(
        self, *, status_code: Optional[AST.Expression], body: Optional[AST.Expression]
    ) -> AST.AstNode:
        return self._instantiate_api_error(
            constructor=AST.Expression(self.get_reference_to_api_error()), status_code=status_code, body=body
        )

    def instantiate_api_error_from_subclass(
        self, *, status_code: Optional[AST.Expression], body: Optional[AST.Expression]
    ) -> AST.AstNode:
        return self._instantiate_api_error(
            constructor=AST.Expression("super().__init__"), status_code=status_code, body=body
        )

    def _instantiate_api_error(
        self,
        *,
        constructor: AST.Expression,
        status_code: Optional[AST.Expression],
        body: Optional[AST.Expression],
    ) -> AST.AstNode:
        def _write(writer: AST.NodeWriter) -> None:
            writer.write_node(constructor)
            writer.write("(")
            if status_code is not None:
                writer.write("status_code=")
                writer.write_node(status_code)
            if body is not None:
                if status_code is not None:
                    writer.write(", ")
                writer.write("body=")
                writer.write_node(body)
            writer.write_line(")")

        return AST.CodeWriter(code_writer=_write)

    def remove_none_from_headers(self, headers: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "remove_none_from_headers"),
                        named_import="remove_none_from_headers",
                    ),
                ),
                args=[headers],
            )
        )
