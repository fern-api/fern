import os
from typing import List, Optional, Set, Tuple

from fern_python.codegen import AST, ExportStrategy, Filepath, Project
from fern_python.external_dependencies.pydantic import (
    PYDANTIC_CORE_DEPENDENCY,
    PydanticVersionCompatibility,
)
from fern_python.generators.fastapi.custom_config import FastAPICustomConfig
from fern_python.generators.pydantic_model.field_metadata import FieldMetadata
from fern_python.source_file_factory import SourceFileFactory


class FernHTTPException:
    CLASS_NAME = "FernHTTPException"
    STATUS_CODE_MEMBER = "status_code"
    NAME_MEMBER = "name"
    CONTENT_MEMBER = "content"

    def __init__(self, filepath: Tuple[Filepath.DirectoryFilepathPart, ...]):
        self.filepath = Filepath(directories=filepath, file=Filepath.FilepathPart(module_name="fern_http_exception"))

    def get_reference_to(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=self.filepath.to_module(),
                named_import=FernHTTPException.CLASS_NAME,
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
        kwargs.append((FernHTTPException.STATUS_CODE_MEMBER, status_code))
        if name is not None:
            kwargs.append((FernHTTPException.NAME_MEMBER, name))
        if content is not None:
            kwargs.append((FernHTTPException.CONTENT_MEMBER, content))
        return AST.ClassInstantiation(
            class_=(
                AST.ClassReference(qualified_name_excluding_import=("super().__init__",))
                if is_super_call
                else self.get_reference_to()
            ),
            kwargs=kwargs,
        )


class Exceptions:
    def __init__(self, filepath: Tuple[Filepath.DirectoryFilepathPart, ...]):
        self.filepath = filepath + (
            Filepath.DirectoryFilepathPart(module_name="exceptions", export_strategy=ExportStrategy(export_all=True)),
        )
        self._module_path = tuple(part.module_name for part in self.filepath)
        self.FernHTTPException = FernHTTPException(filepath=self.filepath)

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

    def UnauthorizedException(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path),
                named_import="UnauthorizedException",
            ),
        )


class CoreUtilities:
    def __init__(self, custom_config: FastAPICustomConfig) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        self.exceptions = Exceptions(filepath=self.filepath)
        self._use_pydantic_field_aliases = custom_config.pydantic_config.use_pydantic_field_aliases
        self._pydantic_compatibility = custom_config.pydantic_config.version

    def copy_to_project(self, *, project: Project) -> None:
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="abstract_fern_service.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="abstract_fern_service"),
            ),
            exports=set(),
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="route_args.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="route_args"),
            ),
            exports={"route_args"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="datetime_utils.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="datetime_utils"),
            ),
            exports={"serialize_datetime"},
        )

        is_v1_on_v2 = self._pydantic_compatibility == PydanticVersionCompatibility.V1_ON_V2
        utilities_path = (
            "with_pydantic_v1_on_v2/with_aliases/pydantic_utilities.py"
            if is_v1_on_v2 and self._use_pydantic_field_aliases
            else (
                "with_pydantic_v1_on_v2/pydantic_utilities.py"
                if is_v1_on_v2
                else (
                    "with_pydantic_aliases/pydantic_utilities.py"
                    if self._use_pydantic_field_aliases
                    else "pydantic_utilities.py"
                )
            )
        )

        exports = {
                "parse_obj_as",
                "UniversalBaseModel",
                "IS_PYDANTIC_V2",
                "universal_root_validator",
                "universal_field_validator",
                "update_forward_refs",
                "UniversalRootModel",
            }

        if v1_on_v2:
            exports.remove("IS_PYDANTIC_V2")

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk=utilities_path,
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="pydantic_utilities"),
            ),
            exports=exports
        )

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="serialization.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="serialization"),
            ),
            exports={"FieldMetadata", "convert_and_respect_annotation_metadata"},
        )

        project.add_dependency(PYDANTIC_CORE_DEPENDENCY)
        self._copy_security_to_project(project=project)
        self._copy_exceptions_to_project(project=project)

    def _copy_security_to_project(self, *, project: Project) -> None:
        directories = self._get_security_filepath()
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="security/bearer.py",
            filepath_in_project=Filepath(
                directories=directories,
                file=Filepath.FilepathPart(module_name="bearer"),
            ),
            exports={"BearerToken"},
        )

    def _copy_exceptions_to_project(self, *, project: Project) -> None:
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="exceptions/handlers.py",
            filepath_in_project=Filepath(
                directories=self.exceptions.filepath,
                file=Filepath.FilepathPart(module_name="handlers"),
            ),
            exports={"default_exception_handler", "fern_http_exception_handler", "http_exception_handler"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="exceptions/unauthorized.py",
            filepath_in_project=Filepath(
                directories=self.exceptions.filepath,
                file=Filepath.FilepathPart(module_name="unauthorized"),
            ),
            exports={"UnauthorizedException"},
        )

    def _copy_file_to_project(
        self, *, project: Project, relative_filepath_on_disk: str, filepath_in_project: Filepath, exports: Set[str]
    ) -> None:
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/fastapi")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileFactory.add_source_file_from_disk(
            project=project,
            path_on_disk=os.path.join(source, relative_filepath_on_disk),
            filepath_in_project=filepath_in_project,
            exports=exports,
        )

    def AbstractFernService(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "abstract_fern_service"),
                named_import="AbstractFernService",
            ),
        )

    INIT_FERN_METHOD_NAME = "_init_fern"

    def get_route_args(self, *, endpoint_method: AST.Expression, default_tag: str) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "route_args"), named_import="get_route_args"
                    ),
                ),
                args=[endpoint_method],
                kwargs=[("default_tag", AST.Expression(f'"{default_tag}"'))],
            )
        )

    def get_serialize_datetime(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "datetime_utils"), named_import="serialize_datetime"
            ),
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
        return self.filepath + (
            Filepath.DirectoryFilepathPart(module_name="security", export_strategy=ExportStrategy(export_all=True)),
        )

    def _get_security_module_path(self) -> AST.ModulePath:
        return tuple(part.module_name for part in self._get_security_filepath())

    def _get_bearer_module_path(self, *submodule: str) -> AST.ModulePath:
        return self._get_security_submodule_path("bearer")

    def _get_security_submodule_path(self, *submodule: str) -> AST.ModulePath:
        return self._get_security_module_path() + submodule

    def get_universal_base_model(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="UniversalBaseModel",
            ),
        )

    def get_is_pydantic_v2(self) -> AST.Expression:
        return AST.Expression(
            AST.Reference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "pydantic_utilities"), named_import="IS_PYDANTIC_V2"
                ),
            )
        )

    def get_update_forward_refs(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="update_forward_refs",
            ),
        )

    def universal_root_validator(self, pre: bool = False) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                    named_import="universal_root_validator",
                ),
            ),
            kwargs=[("pre", AST.Expression(expression="True" if pre else "False"))],
        )

    def universal_field_validator(self, field_name: str, pre: bool = False) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                    named_import="universal_field_validator",
                ),
            ),
            args=[AST.Expression(expression=f'"{field_name}"')],
            kwargs=[("pre", AST.Expression(expression="True" if pre else "False"))],
        )

    def get_field_metadata(self) -> FieldMetadata:
        field_metadata_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "serialization"), named_import="FieldMetadata"
            ),
        )

        return FieldMetadata(reference=field_metadata_reference)
