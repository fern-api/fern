from __future__ import annotations

import os
from typing import Set

from fern_python.codegen import AST, Filepath, Project
from fern_python.codegen.ast.ast_node.node_writer import NodeWriter
from fern_python.external_dependencies import Pydantic
from fern_python.external_dependencies.pydantic import (
    PYDANTIC_CORE_DEPENDENCY,
    PydanticVersionCompatibility,
)
from fern_python.generators.pydantic_model.field_metadata import FieldMetadata
from fern_python.source_file_factory import SourceFileFactory


class CoreUtilities:
    def __init__(
        self,
        allow_skipping_validation: bool,
        use_typeddict_requests: bool,
        use_pydantic_field_aliases: bool,
        pydantic_compatibility: PydanticVersionCompatibility,
    ) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        self._allow_skipping_validation = allow_skipping_validation
        self._use_typeddict_requests = use_typeddict_requests
        self._use_pydantic_field_aliases = use_pydantic_field_aliases
        self._pydantic_compatibility = pydantic_compatibility

    def copy_to_project(self, *, project: Project) -> None:
        is_v1_on_v2 = self._pydantic_compatibility == PydanticVersionCompatibility.V1_ON_V2

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="datetime_utils.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="datetime_utils"),
            ),
            exports={"serialize_datetime"},
        )

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
            exports=exports,
        )
        project.add_dependency(PYDANTIC_CORE_DEPENDENCY)

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="serialization.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="serialization"),
            ),
            exports={"FieldMetadata"},
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

    def get_field_metadata(self) -> FieldMetadata:
        field_metadata_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "serialization"), named_import="FieldMetadata"
            ),
        )

        return FieldMetadata(reference=field_metadata_reference)

    def get_union_metadata(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="UnionMetadata"
            ),
        )

    def get_unchecked_pydantic_base_model(self) -> AST.ClassReference:
        return (
            AST.ClassReference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "unchecked_base_model"),
                    named_import="UncheckedBaseModel",
                ),
            )
            if self._allow_skipping_validation
            else self.get_universal_base_model()
        )

    def get_construct_type(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="construct_type"
            ),
        )

    def _construct_type(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        def write_value_being_casted(writer: NodeWriter) -> None:
            writer.write_reference(self.get_construct_type())
            writer.write("(")
            writer.write_newline_if_last_line_not()
            with writer.indent():
                writer.write("type_ =")
                AST.Expression(type_of_obj).write(writer=writer)
                writer.write(", ")
                writer.write(" # type: ignore")
                writer.write_newline_if_last_line_not()

                writer.write("object_ =")
                obj.write(writer=writer)
                writer.write_newline_if_last_line_not()
            writer.write(")")

        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                AST.TypeHint.invoke_cast(
                    type_casted_to=type_of_obj,
                    value_being_casted=AST.Expression(AST.CodeWriter(write_value_being_casted)),
                )
            )

        return AST.Expression(AST.CodeWriter(write))

    def get_construct(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        return (
            self._construct_type(type_of_obj, obj)
            if self._allow_skipping_validation
            else self.get_parse_obj_as(type_of_obj, obj)
        )

    def get_universal_base_model(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="UniversalBaseModel",
            ),
        )

    def get_update_forward_refs(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="update_forward_refs",
            ),
        )

    def get_parse_obj_as(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "pydantic_utilities"), named_import="parse_obj_as"
                    ),
                ),
                args=[AST.Expression(type_of_obj), obj],
            )
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

    def get_universal_root_model(self) -> AST.ClassReference:
        if self._pydantic_compatibility == PydanticVersionCompatibility.Both:
            return AST.ClassReference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "pydantic_utilities"), named_import="UniversalRootModel"
                ),
            )
        elif self._pydantic_compatibility == PydanticVersionCompatibility.V2:
            return Pydantic(self._pydantic_compatibility).RootModel()
        else:  # V1 or V1_ON_V2
            return Pydantic(self._pydantic_compatibility).BaseModel()
