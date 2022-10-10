import os
import shutil
from typing import Tuple

from fern_python.codegen import AST, Filepath, Project

from ..fastapi_filepath_creator import FastApiFilepathCreator


class CoreUtilities:
    def __init__(self, filepath_creator: FastApiFilepathCreator):
        self._filepath = filepath_creator.generate_filepath_prefix() + (
            Filepath.DirectoryFilepathPart(module_name="core"),
        )
        self._module_path = tuple(part.module_name for part in self._filepath)

    def copy_to_project(self, *, project: Project) -> None:
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/fastapi")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        destination = os.path.join(project.project_filepath, "/".join(self._module_path))
        shutil.copytree(src=source, dst=destination)

    def AbstractFernService(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "abstract_fern_service"),
                named_import="AbstractFernService",
            ),
        )

    INIT_FERN_METHOD_NAME = "_init_fern"

    def FernHTTPException(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "exceptions"), named_import="FernHTTPException"
            ),
        )

    def get_route_args(self, endpoint_method: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "route_args"), named_import="get_route_args"
                    ),
                ),
                args=[endpoint_method],
            )
        )

    def BearerToken(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._get_bearer_module_path()), named_import="BearerToken"
            ),
        )

    def HTTPBearer(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._get_bearer_module_path()), named_import="HTTPBearer"
            ),
        )

    def _get_security_filepath(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return self._filepath + (Filepath.DirectoryFilepathPart(module_name="security"),)

    def _get_security_module_path(self) -> AST.ModulePath:
        return tuple(part.module_name for part in self._get_security_filepath())

    def _get_bearer_module_path(self, *submodule: str) -> AST.ModulePath:
        return self._get_security_submodule_path("bearer")

    def _get_security_submodule_path(self, *submodule: str) -> AST.ModulePath:
        return self._get_security_module_path() + submodule
