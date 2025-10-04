from typing import Dict

import fern.ir.resources as ir_types
from .sdk_declaration_referencer import SdkDeclarationReferencer

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.generators.pydantic_model.model_utilities import can_be_fern_model


class TypeDeclarationReferencer(SdkDeclarationReferencer[ir_types.DeclaredTypeName]):
    def __init__(
        self,
        *,
        skip_resources_module: bool,
        use_typeddict_requests: bool,
        types: Dict[ir_types.TypeId, ir_types.TypeDeclaration],
    ) -> None:
        super().__init__(skip_resources_module=skip_resources_module)
        self._use_typeddict_requests = use_typeddict_requests
        self._types = types

    def get_filepath(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> Filepath:
        should_use_request_dir = self._has_typeddict_variant(name=name, as_request=as_request)
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            )
            + (
                Filepath.DirectoryFilepathPart(
                    module_name=("requests" if should_use_request_dir else "types"),
                    export_strategy=ExportStrategy(export_all=True),
                ),
            ),
            file=Filepath.FilepathPart(module_name=name.name.snake_case.safe_name),
        )

    def get_class_name(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> str:
        should_use_td_naming = self._has_typeddict_variant(name=name, as_request=as_request)
        class_name = name.name.pascal_case.safe_name
        return f"{class_name}Params" if should_use_td_naming else class_name

    def _has_typeddict_variant(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> bool:
        if not self._use_typeddict_requests or not as_request:
            return False
        type_ = self._types[name.type_id]
        return can_be_fern_model(type_=type_.shape, types=self._types)
