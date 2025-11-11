from typing import Dict, Tuple

import fern.ir.resources as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generators.pydantic_model.model_utilities import can_be_fern_model


class TypeDeclarationReferencer(AbstractDeclarationReferencer[ir_types.DeclaredTypeName]):
    def __init__(
        self,
        *,
        use_typeddict_requests: bool,
        types: Dict[ir_types.TypeId, ir_types.TypeDeclaration],
    ) -> None:
        super().__init__()
        self._use_typeddict_requests = use_typeddict_requests
        self._types = types

    def get_filepath(self, *, name: ir_types.DeclaredTypeName, as_request: bool) -> Filepath:
        directories = self._get_directories_for_fern_filepath(
            fern_filepath=name.fern_filepath,
        )

        if self._has_typeddict_variant(name=name, as_request=as_request):
            directories += (
                Filepath.DirectoryFilepathPart(
                    module_name="requests",
                    export_strategy=ExportStrategy(export_all=True),
                ),
            )

        return Filepath(
            directories=directories,
            file=Filepath.FilepathPart(module_name=name.name.snake_case.safe_name),
        )

    def _get_directories_for_fern_filepath_part(
        self, *, fern_filepath_part: ir_types.Name, export_strategy: ExportStrategy
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            Filepath.DirectoryFilepathPart(
                module_name="resources",
                export_strategy=ExportStrategy(export_all=True),
            ),
            Filepath.DirectoryFilepathPart(
                module_name=fern_filepath_part.snake_case.safe_name,
                export_strategy=export_strategy,
            ),
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
