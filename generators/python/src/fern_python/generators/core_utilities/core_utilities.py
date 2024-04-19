import os
from typing import Set

from fern_python.codegen import AST, Filepath, Project
from fern_python.external_dependencies.pydantic import (
    Pydantic,
    PydanticVersionCompatibility,
)
from fern_python.source_file_factory import SourceFileFactory


class CoreUtilities:
    def __init__(self, allow_skipping_validation: bool) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        self._allow_skipping_validation = allow_skipping_validation

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
            relative_filepath_on_disk="pydantic_utilities.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="pydantic_utilities"),
            ),
            exports={"pydantic_v1"},
        )

        if self._allow_skipping_validation:
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="unchecked_base_model.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="unchecked_base_model"),
                ),
                exports={"UncheckedBaseModel", "UnionMetadata", "construct_type"},
            )

    def _copy_file_to_project(
        self, *, project: Project, relative_filepath_on_disk: str, filepath_in_project: Filepath, exports: Set[str]
    ) -> None:
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/pydantic")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileFactory.add_source_file_from_disk(
            project=project,
            path_on_disk=os.path.join(source, relative_filepath_on_disk),
            filepath_in_project=filepath_in_project,
            exports=exports,
        )

    def get_serialize_datetime(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "datetime_utils"), named_import="serialize_datetime"
            ),
        )
   
    def get_union_metadata(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="UnionMetadata"
            ),
        )

    def get_unchecked_pydantic_base_model(self, version: PydanticVersionCompatibility) -> AST.ClassReference:
        return (
            AST.ClassReference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "unchecked_base_model"),
                    named_import="UncheckedBaseModel",
                ),
            )
            if self._allow_skipping_validation
            else Pydantic.BaseModel(version)
        )

    def get_construct_type(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="construct_type"
            ),
        )

    def _construct_type(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                AST.TypeHint.invoke_cast(
                    type_casted_to=type_of_obj,
                    value_being_casted=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=self.get_construct_type(),
                            kwargs=[("type_", AST.Expression(type_of_obj)), ("object_", obj)],
                        )
                    ),
                )
            )

            # mypy gets confused when passing unions for the Type argument
            # https://github.com/pydantic/pydantic/issues/1847
            writer.write_line("# type: ignore")

        return AST.Expression(AST.CodeWriter(write))

    def get_construct(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        return (
            self._construct_type(type_of_obj, obj)
            if self._allow_skipping_validation
            else Pydantic.parse_obj_as(PydanticVersionCompatibility.Both, type_of_obj, obj)
        )

    def get_pydantic_version_import(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"), named_import="pydantic_v1"
            ),
        )
