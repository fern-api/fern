import typing
from abc import ABC, abstractmethod
from typing import Dict, Optional

import fern.ir.resources as ir_types
from ...context.pydantic_generator_context_impl import PydanticGeneratorContextImpl
from ..core_utilities.core_utilities import CoreUtilities
from ..custom_config import SDKCustomConfig
from ..declaration_referencers.type_declaration_referencer import (
    TypeDeclarationReferencer,
)
from fern.generator_exec import GeneratorConfig

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath
from fern_python.generators.sdk.declaration_referencers.root_client_declaration_referencer import (
    RootClientDeclarationReferencer,
)
from fern_python.source_file_factory.source_file_factory import SourceFileFactory


class SdkGeneratorContext(ABC):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        custom_config: SDKCustomConfig,
        project_module_path: AST.ModulePath,
        exported_root_client: RootClientDeclarationReferencer,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.pydantic_generator_context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(
                skip_resources_module=custom_config.improved_imports,
                use_typeddict_requests=custom_config.pydantic_config.use_typeddict_requests,
                types=ir.types,
            ),
            generator_config=generator_config,
            project_module_path=project_module_path,
            allow_skipping_validation=custom_config.pydantic_config.skip_validation,
            use_str_enums=custom_config.pydantic_config.use_str_enums,
            allow_leveraging_defaults=custom_config.pydantic_config.use_provided_defaults,
            use_typeddict_requests=custom_config.pydantic_config.use_typeddict_requests,
            reserved_names={exported_root_client.get_class_name(name=None)},
            skip_formatting=custom_config.skip_formatting,
            union_naming_version=custom_config.pydantic_config.union_naming,
            use_pydantic_field_aliases=custom_config.pydantic_config.use_pydantic_field_aliases,
            pydantic_compatibility=custom_config.pydantic_config.version,
        )

        # This should be replaced with `hasPaginatedEndpoints` in the IR, but that's on IR44, not 39, which is what Python's on
        _has_paginated_endpoints = any(
            map(
                lambda service: any(map(lambda ep: ep.pagination is not None, service.endpoints)),
                ir.services.values(),
            )
        )
        self.core_utilities = CoreUtilities(
            has_paginated_endpoints=_has_paginated_endpoints,
            project_module_path=project_module_path,
            custom_config=custom_config,
        )
        self.custom_config = custom_config
        self.source_file_factory = SourceFileFactory(should_format=not custom_config.skip_formatting)

    @abstractmethod
    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath: ...

    @abstractmethod
    def get_filepath_for_error(self, error_name: ir_types.DeclaredErrorName) -> Filepath: ...

    @abstractmethod
    def get_class_name_for_error(self, error_name: ir_types.DeclaredErrorName) -> str: ...

    @abstractmethod
    def get_reference_to_error(self, error_name: ir_types.DeclaredErrorName) -> AST.ClassReference: ...

    @abstractmethod
    def get_class_name_of_environments(self) -> str: ...

    @abstractmethod
    def get_filepath_for_environments_enum(self) -> Filepath: ...

    @abstractmethod
    def get_reference_to_environments_class(self) -> AST.ClassReference: ...

    @abstractmethod
    def get_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath: ...

    @abstractmethod
    def get_raw_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath: ...

    @abstractmethod
    def get_socket_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath: ...

    @abstractmethod
    def get_reference_to_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId, lazy_import: bool = False
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str: ...

    @abstractmethod
    def get_raw_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str: ...

    @abstractmethod
    def get_async_raw_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str: ...

    @abstractmethod
    def get_socket_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str: ...

    @abstractmethod
    def get_async_socket_client_class_name_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> str: ...

    @abstractmethod
    def get_raw_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_async_raw_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_raw_client_class_reference_for_root_client(
        self,
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_async_raw_client_class_reference_for_root_client(
        self,
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_socket_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_async_socket_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_filepath_for_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath: ...

    @abstractmethod
    def get_reference_to_async_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId, lazy_import: bool = False
    ) -> AST.ClassReference: ...

    @abstractmethod
    def get_class_name_of_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str: ...

    @abstractmethod
    def get_filepath_for_generated_oauth_token_provider(self) -> Filepath: ...

    @abstractmethod
    def get_filepath_for_generated_root_client(self) -> Filepath: ...

    @abstractmethod
    def get_filepath_for_generated_raw_root_client(self) -> Filepath: ...

    @abstractmethod
    def get_class_name_for_generated_root_client(self) -> str: ...

    @abstractmethod
    def get_class_name_for_generated_raw_root_client(self) -> str: ...

    @abstractmethod
    def get_class_name_for_generated_async_raw_root_client(self) -> str: ...

    @abstractmethod
    def get_filepath_for_exported_root_client(self) -> Filepath: ...

    @abstractmethod
    def get_class_name_for_exported_root_client(self) -> str: ...

    @abstractmethod
    def get_literal_header_value(self, header: ir_types.HttpHeader) -> Optional[typing.Union[str, bool]]: ...

    @abstractmethod
    def get_literal_value(self, reference: ir_types.TypeReference) -> Optional[typing.Union[str, bool]]: ...

    @abstractmethod
    def resolved_schema_is_enum(self, reference: ir_types.TypeReference) -> bool: ...

    @abstractmethod
    def resolved_schema_is_optional_enum(self, reference: ir_types.TypeReference) -> bool: ...

    @abstractmethod
    def resolved_schema_is_optional_or_unknown(self, reference: ir_types.TypeReference) -> bool: ...

    @abstractmethod
    def get_types(self) -> Dict[ir_types.TypeId, ir_types.TypeDeclaration]: ...

    @abstractmethod
    def unwrap_optional_type_reference(self, type_reference: ir_types.TypeReference) -> ir_types.TypeReference: ...

    @abstractmethod
    def get_head_method_return_type(self) -> AST.TypeHint: ...
