import os
from typing import Optional, Set

from fern_python.codegen import AST, Filepath, Project
from fern_python.codegen.ast.ast_node.node_writer import NodeWriter
from fern_python.external_dependencies.pydantic import (
    PYDANTIC_CORE_DEPENDENCY,
    PYDANTIC_DEPENDENCY,
    PYDANTIC_V1_DEPENDENCY,
    PYDANTIC_V2_DEPENDENCY,
    PydanticVersionCompatibility,
)
from fern_python.external_dependencies.typing_extensions import (
    TYPING_EXTENSIONS_DEPENDENCY,
)
from fern_python.generators.pydantic_model.field_metadata import FieldMetadata
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.source_file_factory import SourceFileFactory
from fern_python.utils import pascal_case


class CoreUtilities:
    ASYNC_CLIENT_WRAPPER_CLASS_NAME = "AsyncClientWrapper"
    SYNC_CLIENT_WRAPPER_CLASS_NAME = "SyncClientWrapper"

    def __init__(
        self,
        has_paginated_endpoints: bool,
        project_module_path: AST.ModulePath,
        custom_config: SDKCustomConfig,
    ) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        # Promotes usage of `from ... import core`
        self._module_path_unnamed = tuple(part.module_name for part in self.filepath[:-1])  # type: ignore
        self._allow_skipping_validation = custom_config.pydantic_config.skip_validation
        self._use_typeddict_requests = custom_config.pydantic_config.use_typeddict_requests
        self._has_paginated_endpoints = has_paginated_endpoints
        self._version = custom_config.pydantic_config.version
        self._project_module_path = project_module_path
        self._use_pydantic_field_aliases = custom_config.pydantic_config.use_pydantic_field_aliases
        self._should_generate_websocket_clients = custom_config.should_generate_websocket_clients
        self._exclude_types_from_init_exports = custom_config.exclude_types_from_init_exports
        self._custom_pager_base_name = self._sanitize_pager_name(custom_config.custom_pager_name or "CustomPager")

    def copy_to_project(self, *, project: Project) -> None:
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="datetime_utils.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="datetime_utils"),
            ),
            exports={"serialize_datetime"} if not self._exclude_types_from_init_exports else set(),
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="api_error.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="api_error"),
            ),
            exports={"ApiError"} if not self._exclude_types_from_init_exports else set(),
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="jsonable_encoder.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="jsonable_encoder"),
            ),
            exports={"jsonable_encoder"} if not self._exclude_types_from_init_exports else set(),
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="remove_none_from_dict.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="remove_none_from_dict"),
            ),
            exports={"remove_none_from_dict"} if not self._exclude_types_from_init_exports else set(),
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="request_options.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="request_options"),
            ),
            exports={"RequestOptions"} if not self._exclude_types_from_init_exports else set(),
        )

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="file.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="file"),
            ),
            exports={
                "File",
                "convert_file_dict_to_httpx_tuples",
                "with_content_type",
            }
            if not self._exclude_types_from_init_exports
            else {
                "File",
                "with_content_type",
            },
        )
        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="http_client.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="http_client"),
            ),
            exports={"HttpClient", "AsyncHttpClient"} if not self._exclude_types_from_init_exports else set(),
        )

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="http_response.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="http_response"),
            ),
            exports={"HttpResponse", "AsyncHttpResponse"} if not self._exclude_types_from_init_exports else set(),
        )

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="force_multipart.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="force_multipart"),
            ),
            exports=set(),
        )

        is_v1_on_v2 = self._version == PydanticVersionCompatibility.V1_ON_V2
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

        self._copy_file_to_project(
            project=project,
            # Multi-plex between different versions of the file, depending on if we're using Pydantic aliases or not
            relative_filepath_on_disk=utilities_path,
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="pydantic_utilities"),
            ),
            exports=(
                {
                    "parse_obj_as",
                    "UniversalBaseModel",
                    "universal_root_validator",
                    "universal_field_validator",
                    "update_forward_refs",
                    "UniversalRootModel",
                }
                | (set() if is_v1_on_v2 else {"IS_PYDANTIC_V2"})
            )
            if not self._exclude_types_from_init_exports
            else set(),
        )
        project.add_dependency(PYDANTIC_CORE_DEPENDENCY)

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="query_encoder.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="query_encoder"),
            ),
            exports={"encode_query"} if not self._exclude_types_from_init_exports else set(),
        )

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="serialization.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="serialization"),
            ),
            exports={
                "FieldMetadata",
                "convert_and_respect_annotation_metadata",
            }
            if not self._exclude_types_from_init_exports
            else set(),
        )

        if self._has_paginated_endpoints:
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="pagination.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="pagination"),
                ),
                exports={"SyncPager", "AsyncPager"} if not self._exclude_types_from_init_exports else set(),
            )
            # Copy custom pagination file (for user customization)
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="custom_pagination.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="custom_pagination"),
                ),
                exports={f"Sync{self._custom_pager_base_name}", f"Async{self._custom_pager_base_name}"}
                if not self._exclude_types_from_init_exports
                else set(),
                string_replacements={"CustomPager": self._custom_pager_base_name},
            )

        if self._allow_skipping_validation:
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="unchecked_base_model.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="unchecked_base_model"),
                ),
                exports={
                    "UncheckedBaseModel",
                    "UnionMetadata",
                    "construct_type",
                }
                if not self._exclude_types_from_init_exports
                else set(),
            )

        if self._should_generate_websocket_clients:
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="events.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="events"),
                ),
                exports={"EventType", "EventEmitterMixin"} if not self._exclude_types_from_init_exports else set(),
            )

        # Copy the entire http_sse folder
        self._copy_http_sse_folder_to_project(project=project)

        project.add_dependency(TYPING_EXTENSIONS_DEPENDENCY)
        if self._version == PydanticVersionCompatibility.V1:
            project.add_dependency(PYDANTIC_V1_DEPENDENCY)
        elif self._version == PydanticVersionCompatibility.V2:
            project.add_dependency(PYDANTIC_V2_DEPENDENCY)
        elif self._version == PydanticVersionCompatibility.V1_ON_V2:
            # We're using v2 but with v1 compatibility layer
            project.add_dependency(PYDANTIC_V2_DEPENDENCY)
        else:
            project.add_dependency(PYDANTIC_DEPENDENCY)

    def _copy_file_to_project(
        self,
        *,
        project: Project,
        relative_filepath_on_disk: str,
        filepath_in_project: Filepath,
        exports: Set[str],
        string_replacements: Optional[dict[str, str]] = None,
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
            string_replacements=string_replacements,
        )

    def _copy_http_sse_folder_to_project(self, *, project: Project) -> None:
        """Copy the http_sse folder using the same approach as individual file copying"""
        source = (
            os.path.join(os.path.dirname(__file__), "../../../../../core_utilities/sdk")
            if "PYTEST_CURRENT_TEST" in os.environ
            else "/assets/core_utilities"
        )
        folder_path_on_disk = os.path.join(source, "http_sse")

        # Define exports for each file
        file_exports = {
            "_api.py": {"EventSource", "connect_sse", "aconnect_sse"},
            "_exceptions.py": {"SSEError"},
            "_models.py": {"ServerSentEvent"},
        }

        # Walk through all files in the folder and copy them maintaining directory structure
        for root, dirs, files in os.walk(folder_path_on_disk):
            for file in files:
                if file.endswith(".py"):  # Only copy Python files
                    # Calculate relative path from the source folder
                    rel_path = os.path.relpath(os.path.join(root, file), folder_path_on_disk)

                    # Convert to module path (remove .py extension and split by path separator)
                    module_parts = rel_path.replace(".py", "").split(os.sep)

                    # Build the filepath in project - http_sse goes under core
                    if len(module_parts) == 1:
                        # Single file in root of folder
                        filepath_in_project = Filepath(
                            directories=self.filepath + (Filepath.DirectoryFilepathPart(module_name="http_sse"),),
                            file=Filepath.FilepathPart(module_name=module_parts[0]),
                        )
                    else:
                        # File in subdirectory - add subdirectories to the base folder path
                        directories = list(self.filepath) + [Filepath.DirectoryFilepathPart(module_name="http_sse")]
                        for part in module_parts[:-1]:
                            directories.append(Filepath.DirectoryFilepathPart(module_name=part))

                        filepath_in_project = Filepath(
                            directories=tuple(directories), file=Filepath.FilepathPart(module_name=module_parts[-1])
                        )

                    # Use the same approach as as_is_copier.py
                    SourceFileFactory.add_source_file_from_disk(
                        project=project,
                        path_on_disk=os.path.join(root, file),
                        filepath_in_project=filepath_in_project,
                        exports=file_exports.get(file, set()),
                    )

    def get_reference_to_api_error(self, as_snippet: bool = False) -> AST.ClassReference:
        module_path = self._project_module_path + self._module_path if as_snippet else self._module_path
        module = (
            AST.Module.snippet(module_path=(module_path + ("api_error",)))
            if as_snippet
            else AST.Module.local(*module_path, "api_error")
        )
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(module=module, named_import="ApiError"),
        )

    def get_oauth_token_provider(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "oauth_token_provider"), named_import="OAuthTokenProvider"
            ),
        )

    def instantiate_api_error(
        self,
        *,
        headers: Optional[AST.Expression],
        status_code: Optional[AST.Expression],
        body: Optional[AST.Expression],
    ) -> AST.AstNode:
        return self._instantiate_api_error(
            constructor=AST.Expression(self.get_reference_to_api_error()),
            headers=headers,
            status_code=status_code,
            body=body,
        )

    def instantiate_api_error_from_subclass(
        self,
        *,
        headers: Optional[AST.Expression],
        status_code: Optional[AST.Expression],
        body: Optional[AST.Expression],
    ) -> AST.AstNode:
        return self._instantiate_api_error(
            constructor=AST.Expression("super().__init__"),
            status_code=status_code,
            body=body,
            headers=headers,
            wrap_headers_in_dict=False,
        )

    def _instantiate_api_error(
        self,
        *,
        constructor: AST.Expression,
        headers: Optional[AST.Expression],
        status_code: Optional[AST.Expression],
        body: Optional[AST.Expression],
        wrap_headers_in_dict: bool = True,
    ) -> AST.AstNode:
        def _write(writer: AST.NodeWriter) -> None:
            writer.write_node(constructor)
            writer.write("(")
            if status_code is not None:
                writer.write("status_code=")
                writer.write_node(status_code)
                writer.write(", ")
            if headers is not None:
                if wrap_headers_in_dict:
                    writer.write("headers=dict(")
                    writer.write_node(headers)
                    writer.write("), ")
                else:
                    writer.write("headers=")
                    writer.write_node(headers)
                    writer.write(", ")
            if body is not None:
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

    def convert_and_respect_annotation_metadata(
        self,
        object_: AST.Expression,
        annotation: AST.TypeHint,
    ) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "serialization"),
                        named_import="convert_and_respect_annotation_metadata",
                    ),
                ),
                kwargs=[
                    ("object_", object_),
                    ("annotation", AST.Expression(annotation)),
                    ("direction", AST.Expression(expression='"write"')),
                ],
            )
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

    def with_content_type(self, obj: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("with_content_type",),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path_unnamed), named_import="core"
                    ),
                ),
                args=[obj],
            )
        )

    def http_client(
        self,
        base_client: AST.Expression,
        base_url: Optional[AST.Expression],
        base_headers: AST.Expression,
        base_timeout: AST.Expression,
        is_async: bool,
    ) -> AST.Expression:
        func_args = [
            ("httpx_client", base_client),
            ("base_headers", base_headers),
            ("base_timeout", base_timeout),
        ]
        if base_url is not None:
            func_args.append(("base_url", base_url))
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "http_client"),
                        named_import="HttpClient" if not is_async else "AsyncHttpClient",
                    ),
                ),
                kwargs=func_args,
            )
        )

    def get_field_metadata(self) -> FieldMetadata:
        field_metadata_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "serialization"), named_import="FieldMetadata"
            ),
        )

        return FieldMetadata(reference=field_metadata_reference)

    def get_union_metadata(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"), named_import="UnionMetadata"
            ),
        )

    def get_unchecked_pydantic_base_model(self) -> AST.Reference:
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
            else self._parse_obj_as(type_of_obj, obj)
        )

    def get_update_forward_refs(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="update_forward_refs",
            ),
        )

    def get_paginator_reference(self, is_async: bool) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pagination"),
                named_import="AsyncPager" if is_async else "SyncPager",
            ),
        )

    def get_custom_paginator_reference(self, is_async: bool) -> AST.ClassReference:
        pager_name = f"Async{self._custom_pager_base_name}" if is_async else f"Sync{self._custom_pager_base_name}"
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "custom_pagination"),
                named_import=pager_name,
            ),
        )

    def get_paginator_type(self, inner_type: AST.TypeHint, response_type: AST.TypeHint, is_async: bool) -> AST.TypeHint:
        return AST.TypeHint(
            type=self.get_paginator_reference(is_async),
            type_parameters=[AST.TypeParameter(inner_type), AST.TypeParameter(response_type)],
        )

    def instantiate_paginator(
        self,
        is_async: bool,
        has_next: AST.Expression,
        items: AST.Expression,
        get_next: AST.Expression,
        response: AST.Expression,
    ) -> AST.Expression:
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self.get_paginator_reference(is_async),
                args=[],
                kwargs=[
                    ("has_next", has_next),
                    ("items", items),
                    ("get_next", get_next),
                    ("response", response),
                ],
            )
        )

    def get_encode_query(self, obj: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(),
                    import_=AST.ReferenceImport(
                        module=AST.Module.local(*self._module_path, "query_encoder"),
                        named_import="encode_query",
                    ),
                ),
                args=[obj],
            )
        )

    def get_universal_base_model(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "unchecked_base_model"),
                named_import="UncheckedBaseModel",
            ),
        )

    def _parse_obj_as(self, type_of_obj: AST.TypeHint, obj: AST.Expression) -> AST.Expression:
        def write_value_being_casted(writer: NodeWriter) -> None:
            writer.write_reference(self.get_parse_obj_as())
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

    def get_parse_obj_as(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"), named_import="parse_obj_as"
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

    def get_event_emitter_mixin(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "events"), named_import="EventEmitterMixin"
            ),
        )

    def get_event_type(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "events"), named_import="EventType"
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

    def _sanitize_pager_name(self, name: str) -> str:
        """Sanitize the pager name to be a valid Python identifier in PascalCase."""
        return pascal_case(name)
