from typing import Dict, Tuple

import fern.ir.resources as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.generators.pydantic_model.typeddict import FernTypedDict

from .sdk_declaration_referencer import SdkDeclarationReferencer


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
        file_path: Tuple[Filepath.DirectoryFilepathPart, ...] = self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            )
        
        if self._use_typeddict_requests:
            top_level_module = "types"
            if should_use_request_dir:
                top_level_module = "requests"

            file_path = (
                Filepath.DirectoryFilepathPart(
                    module_name=top_level_module,
                    export_strategy=ExportStrategy(export_all=False, export_as_namespace=True),
                ),
            ) + file_path
        else:
            file_path = file_path + (
                Filepath.DirectoryFilepathPart(
                    module_name="types",
                    export_strategy=ExportStrategy(export_all=True),
                ),
            )

        return Filepath(file_path, file=Filepath.FilepathPart(module_name=name.name.snake_case.safe_name),)

    def get_class_name(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> str:
        should_use_td_naming = self._has_typeddict_variant(name=name, as_request=as_request)
        class_name = name.name.pascal_case.safe_name
        return f"{class_name}Params" if should_use_td_naming else class_name

    def _has_typeddict_variant(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> bool:
        if not self._use_typeddict_requests or not as_request:
            return False
        type_ = self._types[name.type_id]
        return FernTypedDict.can_be_typeddict(type_=type_.shape, types=self._types)
