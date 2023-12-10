from typing import Optional

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath
from fern_python.utils import pascal_case

from ..custom_config import SDKCustomConfig
from ..declaration_referencers import (
    EnvironmentsEnumDeclarationReferencer,
    ErrorDeclarationReferencer,
    RootClientDeclarationReferencer,
    SubpackageAsyncClientDeclarationReferencer,
    SubpackageClientDeclarationReferencer,
)
from .sdk_generator_context import SdkGeneratorContext


class SdkGeneratorContextImpl(SdkGeneratorContext):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        custom_config: SDKCustomConfig,
        project_module_path: AST.ModulePath,
    ):
        super().__init__(
            ir=ir,
            generator_config=generator_config,
            custom_config=custom_config,
            project_module_path=project_module_path,
        )
        client_class_name = custom_config.client_class_name or (
            pascal_case(generator_config.organization) + pascal_case(generator_config.workspace_name)
        )
        self._error_declaration_referencer = ErrorDeclarationReferencer()
        self._environments_enum_declaration_referencer = EnvironmentsEnumDeclarationReferencer(
            client_class_name=client_class_name,
        )
        self._subpackage_client_declaration_referencer = SubpackageClientDeclarationReferencer()
        self._subpackage_async_client_declaration_referencer = SubpackageAsyncClientDeclarationReferencer()
        self._root_client_declaration_referencer = RootClientDeclarationReferencer(
            root_class_name=client_class_name,
            root_client_filename=custom_config.client_filename,
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
        return self._environments_enum_declaration_referencer.get_class_reference(name=None)

    def get_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_filepath(name=subpackage)

    def get_class_name_of_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_class_name(name=subpackage)

    def get_reference_to_error(self, error_name: ir_types.DeclaredErrorName) -> AST.ClassReference:
        return self._error_declaration_referencer.get_class_reference(name=error_name)

    def get_reference_to_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_client_declaration_referencer.get_class_reference(name=subpackage)

    def get_filepath_for_root_client(self) -> Filepath:
        return self._root_client_declaration_referencer.get_filepath(name=None)

    def get_class_name_for_root_client(self) -> str:
        return self._root_client_declaration_referencer.get_class_name(name=None)

    def get_filepath_for_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_filepath(name=subpackage)

    def get_class_name_of_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_class_name(name=subpackage)

    def get_reference_to_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> AST.ClassReference:
        subpackage = self.ir.subpackages[subpackage_id]
        return self._subpackage_async_client_declaration_referencer.get_class_reference(name=subpackage)

    def get_literal_header_value(self, header: ir_types.HttpHeader) -> Optional[str]:
        type = header.value_type.get_as_union()
        if type.type == "named":
            shape = self.pydantic_generator_context.get_declaration_for_type_id(type.type_id).shape.get_as_union()
            if shape.type == "alias":
                resolved_type = shape.resolved_type.get_as_union()
                if resolved_type.type == "container":
                    resolved_container_type = resolved_type.container.get_as_union()
                    if resolved_container_type.type == "literal":
                        return resolved_container_type.literal.visit(
                            boolean=lambda boolean: "true" if boolean else "false",
                            string=lambda string: string,
                        )
        if type.type == "container":
            container_type = type.container.get_as_union()
            if container_type.type == "literal":
                return container_type.literal.visit(
                    boolean=lambda boolean: "true" if boolean else "false",
                    string=lambda string: string,
                )
        return None
