import typing
from typing import Optional

import fern.ir.resources as ir_types
from ..custom_config import SDKCustomConfig
from ..declaration_referencers import (
    EnvironmentsEnumDeclarationReferencer,
    ErrorDeclarationReferencer,
    OAuthTokenProviderDeclarationReferencer,
    RootAsyncRawClientDeclarationReferencer,
    RootClientDeclarationReferencer,
    RootRawClientDeclarationReferencer,
    SubpackageAsyncClientDeclarationReferencer,
    SubpackageAsyncRawClientDeclarationReferencer,
    SubpackageAsyncSocketClientDeclarationReferencer,
    SubpackageClientDeclarationReferencer,
    SubpackageRawClientDeclarationReferencer,
    SubpackageSocketClientDeclarationReferencer,
)
from .sdk_generator_context import SdkGeneratorContext
from fern.generator_exec import GeneratorConfig

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath
from fern_python.utils import pascal_case


class SdkGeneratorContextImpl(SdkGeneratorContext):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        custom_config: SDKCustomConfig,
        project_module_path: AST.ModulePath,
    ):
        client_class_name = (
            custom_config.client_class_name
            or custom_config.client.class_name
            or (pascal_case(generator_config.organization) + pascal_case(generator_config.workspace_name))
        )
        exported_client_class_name = custom_config.client.exported_class_name or client_class_name
        client_filename = custom_config.client_filename or custom_config.client.filename

        self._root_generated_client_declaration_referencer = RootClientDeclarationReferencer(
            client_class_name=client_class_name,
            client_filename=client_filename,
            skip_resources_module=custom_config.improved_imports,
        )
        self._root_generated_raw_client_declaration_referencer = RootRawClientDeclarationReferencer(
            client_class_name=client_class_name,
            client_filename=client_filename,
            skip_resources_module=custom_config.improved_imports,
        )
        self._root_generated_async_raw_client_declaration_referencer = RootAsyncRawClientDeclarationReferencer(
            client_class_name=client_class_name,
            client_filename=client_filename,
            skip_resources_module=custom_config.improved_imports,
        )

        self._root_exported_client_declaration_referencer = RootClientDeclarationReferencer(
            client_class_name=exported_client_class_name,
            client_filename=custom_config.client.exported_filename or client_filename,
            skip_resources_module=custom_config.improved_imports,
        )

        super().__init__(
            ir=ir,
            generator_config=generator_config,
            custom_config=custom_config,
            project_module_path=project_module_path,
            exported_root_client=self._root_exported_client_declaration_referencer,
        )

        self._error_declaration_referencer = ErrorDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._environments_enum_declaration_referencer = EnvironmentsEnumDeclarationReferencer(
            client_class_name=exported_client_class_name,
            skip_resources_module=custom_config.improved_imports,
        )
        self._subpackage_client_declaration_referencer = SubpackageClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._subpackage_raw_client_declaration_referencer = SubpackageRawClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._subpackage_socket_client_declaration_referencer = SubpackageSocketClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._subpackage_async_client_declaration_referencer = SubpackageAsyncClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._subpackage_async_raw_client_declaration_referencer = SubpackageAsyncRawClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._subpackage_async_socket_client_declaration_referencer = SubpackageAsyncSocketClientDeclarationReferencer(
            skip_resources_module=custom_config.improved_imports
        )
        self._oauth_generated_client_declaration_referencer = OAuthTokenProviderDeclarationReferencer(
            client_class_name=client_class_name,
            client_filename=client_filename,
            skip_resources_module=custom_config.improved_imports,
        )
        self._custom_config = custom_config
        self._project_module_path = project_module_path

    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath:
        return self._project_module_path + module_path

    def get_filepath_for_error(self, error_name: ir_types.DeclaredErrorName) -> Filepath:
        return self._error_declaration_referencer.get_filepath(name=error_name)

    def get_class_name_for_error(self, error_name: ir_types.DeclaredErrorName) -> str:
        return self._error_declaration_referencer.get_class_name(name=error_name)

    def get_class_name_of_environments(self) -> str:
        return self._environments_enum_declaration_referencer.get_class_name(name=None)

    def get_filepath_for_environments_enum(self) -> Filepath:
        return self._environments_enum_declaration_referencer.get_filepath(name=None)

    def get_reference_to_environments_class(self) -> AST.ClassReference:
        return self._environments_enum_declaration_referencer.get_class_reference(name=None, as_request=False)

    def get_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_filepath(name=subpackage)

    def get_raw_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_raw_client_declaration_referencer.get_filepath(name=subpackage)

    def get_socket_client_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_socket_client_declaration_referencer.get_filepath(name=subpackage)

    def get_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_class_name(name=subpackage)

    def get_raw_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_raw_client_declaration_referencer.get_class_name(name=subpackage)

    def get_socket_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_socket_client_declaration_referencer.get_class_name(name=subpackage)

    def get_async_raw_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_raw_client_declaration_referencer.get_class_name(name=subpackage)

    def get_async_socket_client_class_name_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_socket_client_declaration_referencer.get_class_name(name=subpackage)

    def get_raw_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_raw_client_declaration_referencer.get_class_reference(name=subpackage, as_request=False)

    def get_socket_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_socket_client_declaration_referencer.get_class_reference(
            name=subpackage, as_request=False
        )

    def get_async_raw_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_raw_client_declaration_referencer.get_class_reference(
            name=subpackage, as_request=False
        )

    def get_async_socket_client_class_reference_for_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_socket_client_declaration_referencer.get_class_reference(
            name=subpackage, as_request=False
        )

    def get_raw_client_class_reference_for_root_client(self) -> AST.ClassReference:
        return self._root_generated_raw_client_declaration_referencer.get_class_reference(name=None, as_request=False)

    def get_async_raw_client_class_reference_for_root_client(
        self,
    ) -> AST.ClassReference:
        return self._root_generated_async_raw_client_declaration_referencer.get_class_reference(
            name=None, as_request=False
        )

    def get_reference_to_error(self, error_name: ir_types.DeclaredErrorName) -> AST.ClassReference:
        return self._error_declaration_referencer.get_class_reference(name=error_name, as_request=False)

    def get_reference_to_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId, lazy_import: bool = False
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_class_reference(
            name=subpackage,
            as_request=False,
            as_if_type_checking_import=lazy_import,
            has_been_dynamically_imported=lazy_import,
        )

    def get_filepath_for_generated_oauth_token_provider(self) -> Filepath:
        return self._oauth_generated_client_declaration_referencer.get_filepath(name=None)

    def get_filepath_for_generated_root_client(self) -> Filepath:
        return self._root_generated_client_declaration_referencer.get_filepath(name=None)

    def get_filepath_for_generated_raw_root_client(self) -> Filepath:
        return self._root_generated_raw_client_declaration_referencer.get_filepath(name=None)

    def get_class_name_for_generated_root_client(self) -> str:
        return self._root_generated_client_declaration_referencer.get_class_name(name=None)

    def get_class_name_for_generated_raw_root_client(self) -> str:
        return self._root_generated_raw_client_declaration_referencer.get_class_name(name=None)

    def get_class_name_for_generated_async_raw_root_client(self) -> str:
        return self._root_generated_async_raw_client_declaration_referencer.get_class_name(name=None)

    def get_filepath_for_exported_root_client(self) -> Filepath:
        return self._root_exported_client_declaration_referencer.get_filepath(name=None)

    def get_class_name_for_exported_root_client(self) -> str:
        return self._root_exported_client_declaration_referencer.get_class_name(name=None)

    def get_filepath_for_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_filepath(name=subpackage)

    def get_class_name_of_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_class_name(name=subpackage)

    def get_reference_to_async_subpackage_service(
        self, subpackage_id: ir_types.SubpackageId, lazy_import: bool = False
    ) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_class_reference(
            name=subpackage,
            as_request=False,
            as_if_type_checking_import=lazy_import,
            has_been_dynamically_imported=lazy_import,
        )

    def get_literal_value(self, reference: ir_types.TypeReference) -> Optional[typing.Union[str, bool]]:
        type = reference.get_as_union()
        if type.type == "named":
            shape = self.pydantic_generator_context.get_declaration_for_type_id(type.type_id).shape.get_as_union()
            if shape.type == "alias":
                resolved_type = shape.resolved_type.get_as_union()
                if resolved_type.type == "container":
                    return self._get_literal_value(resolved_type.container)
        if type.type == "container":
            return self._get_literal_value(type.container)
        return None

    def _get_literal_value(self, container_type: ir_types.ContainerType) -> Optional[typing.Union[str, bool]]:
        container_union = container_type.get_as_union()
        if container_union.type == "literal":
            literal_union = container_union.literal.get_as_union()
            if literal_union.type == "string":
                return literal_union.string
            elif literal_union.type == "boolean":
                return literal_union.boolean
        return None

    def get_literal_header_value(self, header: ir_types.HttpHeader) -> Optional[typing.Union[str, bool]]:
        return self.get_literal_value(header.value_type)

    def resolved_schema_is_enum(self, reference: ir_types.TypeReference) -> bool:
        reference_union = reference.get_as_union()
        while reference_union.type == "named":
            declaration = self.pydantic_generator_context.get_declaration_for_type_id(reference_union.type_id)
            shape = declaration.shape.get_as_union()
            if shape.type == "enum":
                return True
            elif shape.type == "alias":
                reference_union = shape.alias_of.get_as_union()
            else:
                break
        return False

    def resolved_schema_is_optional_enum(self, reference: ir_types.TypeReference) -> bool:
        reference_union = reference.get_as_union()
        is_optional = False
        while reference_union.type == "container" or reference_union.type == "named":
            if reference_union.type == "container":
                container_union = reference_union.container.get_as_union()
                if container_union.type == "optional":
                    reference_union = container_union.optional.get_as_union()
                    is_optional = True
                elif container_union.type == "nullable":
                    reference_union = container_union.nullable.get_as_union()
                    is_optional = True
                else:
                    break
            elif reference_union.type == "named":
                declaration = self.pydantic_generator_context.get_declaration_for_type_id(reference_union.type_id)
                shape = declaration.shape.get_as_union()
                if shape.type == "enum":
                    return is_optional
                elif shape.type == "alias":
                    reference_union = shape.alias_of.get_as_union()
                else:
                    break
        return False

    def get_types(self) -> typing.Dict[ir_types.TypeId, ir_types.TypeDeclaration]:
        return self.ir.types

    def unwrap_optional_type_reference(self, type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
        type_union = type_reference.get_as_union()
        if type_union.type == "container":
            container_union = type_union.container.get_as_union()
            if container_union.type == "optional":
                return self.unwrap_optional_type_reference(container_union.optional)
        return type_reference

    def resolved_schema_is_optional_or_unknown(self, reference: ir_types.TypeReference) -> bool:
        reference_union = reference.get_as_union()
        while (
            reference_union.type == "container" or reference_union.type == "named" or reference_union.type == "unknown"
        ):
            if reference_union.type == "unknown":
                return True
            elif reference_union.type == "container":
                container_union = reference_union.container.get_as_union()
                if container_union.type == "optional":
                    return True
                elif container_union.type == "nullable":
                    return True
                else:
                    break
            elif reference_union.type == "named":
                declaration = self.pydantic_generator_context.get_declaration_for_type_id(reference_union.type_id)
                shape = declaration.shape.get_as_union()
                if shape.type == "alias":
                    reference_union = shape.alias_of.get_as_union()
                else:
                    break
        return False

    def get_head_method_return_type(self) -> AST.TypeHint:
        return AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())
