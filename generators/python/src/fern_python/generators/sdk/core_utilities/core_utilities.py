import os
from typing import Optional, Set

from fern_python.codegen import AST, Filepath, Project
from fern_python.external_dependencies.pydantic import PYDANTIC_DEPENDENCY
from fern_python.external_dependencies.typing_extensions import (
    TYPING_EXTENSIONS_DEPENDENCY,
)
from fern_python.external_dependencies.pydantic import Pydantic, PydanticVersionCompatibility
from fern_python.source_file_factory import SourceFileFactory


class CoreUtilities:
    ASYNC_CLIENT_WRAPPER_CLASS_NAME = "AsyncClientWrapper"
    SYNC_CLIENT_WRAPPER_CLASS_NAME = "SyncClientWrapper"

    def __init__(self, allow_skipping_validation: bool) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        # Promotes usage of `from ... import core`
        self._module_path_unnamed = tuple(part.module_name for part in self.filepath[:-1])  # type: ignore
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
            relative_filepath_on_disk="remove_none_from_dict.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="remove_none_from_dict"),
            ),
            exports={"remove_none_from_dict"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="request_options.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="request_options"),
            ),
            exports={"RequestOptions"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="file.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="file"),
            ),
            exports={"File", "convert_file_dict_to_httpx_tuples"},
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="http_client.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="http_client"),
            ),
            exports={"HttpClient", "AsyncHttpClient"},
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

        project.add_dependency(TYPING_EXTENSIONS_DEPENDENCY)
        project.add_dependency(PYDANTIC_DEPENDENCY)

    def _copy_file_to_project(
        self, *, project: Project, relative_filepath_on_disk: str, filepath_in_project: Filepath, exports: Set[str]
    ) -> None:
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/sdk")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        SourceFileFactory.add_source_file_from_disk(
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

    def get_reference_to_client_wrapper(self, *, is_async: bool) -> AST.ClassReference:
        if is_async:
            return AST.ClassReference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "client_wrapper"),
                    named_import=CoreUtilities.ASYNC_CLIENT_WRAPPER_CLASS_NAME,
                ),
            )
        else:
            return AST.ClassReference(
                qualified_name_excluding_import=(),
                import_=AST.ReferenceImport(
                    module=AST.Module.local(*self._module_path, "client_wrapper"),
                    named_import=CoreUtilities.SYNC_CLIENT_WRAPPER_CLASS_NAME,
                ),
            )

    def remove_none_from_dict(self, headers: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "remove_none_from_dict"),
                        named_import="remove_none_from_dict",
                    ),
                ),
                args=[headers],
            )
        )

    def jsonable_encoder(self, obj: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "jsonable_encoder"),
                        named_import="jsonable_encoder",
                    ),
                ),
                args=[obj],
            )
        )

    def serialize_datetime(self, datetime: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "datetime_utils"), named_import="serialize_datetime"
                    ),
                ),
                args=[datetime],
            )
        )

    def get_reference_to_request_options(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "request_options"), named_import="RequestOptions"
            ),
        )

    def get_reference_to_file_types(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=("File",),
            import_=AST.ReferenceImport(module=AST.Module.local(*self._module_path_unnamed), named_import="core"),
        )

    def get_type_hint_of_file_types(self) -> AST.TypeHint:
        return AST.TypeHint(self.get_reference_to_file_types())

    def httpx_tuple_converter(self, obj: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("convert_file_dict_to_httpx_tuples",),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path_unnamed), named_import="core"
                    ),
                ),
                args=[obj],
            )
        )

    def http_client(self, obj: AST.Expression, is_async: bool) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "http_client"),
                        named_import="HttpClient" if not is_async else "AsyncHttpClient",
                    ),
                ),
                kwargs=[("httpx_client", obj)],
            )
        )
    
    def get_union_metadata(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="UnionMetadata"
            ),
        )

    def get_unchecked_pydantic_base_model(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="UncheckedBaseModel"
            ),
        )
    
    def get_construct_type(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="construct_type"
            ),
        )

    def get_construct(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        return AST.TypeHint.invoke_cast(
            type_casted_to=type_of_obj,
            value_being_casted=AST.FunctionInvocation(
                        function_definition=self.get_construct_type(),
                        kwargs=[
                            ("type_", AST.Expression(type_of_obj._type)), 
                            ("object_", obj)
                        ],
                    )
        ) if self._allow_skipping_validation else Pydantic.parse_obj_as(PydanticVersionCompatibility.Both, type_of_obj, obj)
