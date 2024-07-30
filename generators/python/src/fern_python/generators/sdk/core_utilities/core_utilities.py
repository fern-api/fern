import os
from typing import Optional, Set

from fern_python.codegen import AST, Filepath, Project
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
from fern_python.source_file_factory import SourceFileFactory


class CoreUtilities:
    ASYNC_CLIENT_WRAPPER_CLASS_NAME = "AsyncClientWrapper"
    SYNC_CLIENT_WRAPPER_CLASS_NAME = "SyncClientWrapper"

    def __init__(
        self,
        allow_skipping_validation: bool,
        has_paginated_endpoints: bool,
        version: PydanticVersionCompatibility,
        project_module_path: AST.ModulePath,
        use_typeddict_requests: bool,
    ) -> None:
        self.filepath = (Filepath.DirectoryFilepathPart(module_name="core"),)
        self._module_path = tuple(part.module_name for part in self.filepath)
        # Promotes usage of `from ... import core`
        self._module_path_unnamed = tuple(part.module_name for part in self.filepath[:-1])  # type: ignore
        self._allow_skipping_validation = allow_skipping_validation
        self._use_typeddict_requests = use_typeddict_requests
        self._has_paginated_endpoints = has_paginated_endpoints
        self._version = version
        self._project_module_path = project_module_path

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

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="pydantic_utilities.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="pydantic_utilities"),
            ),
            exports={
                "deep_union_pydantic_dicts",
                "parse_obj_as",
                "UniversalBaseModel",
                "IS_PYDANTIC_V2",
                "universal_root_validator",
                "universal_field_validator",
                "update_forward_refs",
                "UniversalRootModel",
            },
        )
        project.add_dependency(PYDANTIC_CORE_DEPENDENCY)

        self._copy_file_to_project(
            project=project,
            relative_filepath_on_disk="query_encoder.py",
            filepath_in_project=Filepath(
                directories=self.filepath,
                file=Filepath.FilepathPart(module_name="query_encoder"),
            ),
            exports={"encode_query"},
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

        if self._has_paginated_endpoints:
            self._copy_file_to_project(
                project=project,
                relative_filepath_on_disk="pagination.py",
                filepath_in_project=Filepath(
                    directories=self.filepath,
                    file=Filepath.FilepathPart(module_name="pagination"),
                ),
                exports={"SyncPager", "AsyncPager"},
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
        if self._version == PydanticVersionCompatibility.V1:
            project.add_dependency(PYDANTIC_V1_DEPENDENCY)
        elif self._version == PydanticVersionCompatibility.V2:
            project.add_dependency(PYDANTIC_V2_DEPENDENCY)
        else:
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

    def convert_and_respect_annotation_metadata(
        self, object_: AST.Expression, annotation: AST.TypeHint
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

    def get_paginator_type(self, inner_type: AST.TypeHint, is_async: bool) -> AST.TypeHint:
        return AST.TypeHint(
            type=self.get_paginator_reference(is_async),
            type_parameters=[AST.TypeParameter(inner_type)],
        )

    def instantiate_paginator(
        self, is_async: bool, has_next: AST.Expression, items: AST.Expression, get_next: AST.Expression
    ) -> AST.Expression:
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self.get_paginator_reference(is_async),
                args=[],
                kwargs=[
                    ("has_next", has_next),
                    ("items", items),
                    ("get_next", get_next),
                ],
            )
        )

    def get_pydantic_deep_union_import(self) -> AST.Reference:
        return AST.Reference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.local(*self._module_path, "pydantic_utilities"),
                named_import="deep_union_pydantic_dicts",
            ),
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
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                AST.TypeHint.invoke_cast(
                    type_casted_to=type_of_obj,
                    value_being_casted=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=self.get_parse_obj_as(),
                            kwargs=[("type_", AST.Expression(type_of_obj)), ("object_", obj)],
                        )
                    ),
                )
            )

            # mypy gets confused when passing unions for the Type argument
            # https://github.com/pydantic/pydantic/issues/1847
            writer.write_line("# type: ignore")

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
