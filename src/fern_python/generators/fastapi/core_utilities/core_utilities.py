import os
import shutil
from typing import List, Optional, Tuple

from fern_python.codegen import AST, Filepath, Project

from ..fastapi_filepath_creator import FastApiFilepathCreator


class FernHTTPException:
    def __init__(self, module_path: AST.ModulePath):
        self._module_path = module_path

    def get_reference_to(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import="FernHTTPException",
            ),
        )

    def create(
        self,
        *,
        status_code: AST.Expression,
        name: Optional[AST.Expression],
        content: Optional[AST.Expression],
        is_super_call: bool = False,
    ) -> AST.ClassInstantiation:
        kwargs: List[Tuple[str, AST.Expression]] = []
        kwargs.append(("status_code", status_code))
        if name is not None:
            kwargs.append(("name", name))
        if content is not None:
            kwargs.append(("content", content))
        return AST.ClassInstantiation(
            class_=AST.ClassReference(qualified_name_excluding_import=("super().__init__",))
            if is_super_call
            else self.get_reference_to(),
            kwargs=kwargs,
        )


class Exceptions:
    def __init__(self, module_path: AST.ModulePath):
        self._module_path = (*module_path, "exceptions")
        self.FernHTTPException = FernHTTPException(module_path=self._module_path)

    def fern_http_exception_handler(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import="fern_http_exception_handler",
            ),
        )

    def http_exception_handler(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import="http_exception_handler",
            ),
        )

    def default_exception_handler(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import="default_exception_handler",
            ),
        )


class CoreUtilities:
    def __init__(self, filepath_creator: FastApiFilepathCreator):
        self._filepath = filepath_creator.generate_filepath_prefix() + (
            Filepath.DirectoryFilepathPart(module_name="core"),
        )
        self._module_path = tuple(part.module_name for part in self._filepath)
        self.exceptions = Exceptions(module_path=self._module_path)

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
