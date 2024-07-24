from typing import Tuple

import fern.ir.resources as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer


class TypeDeclarationReferencer(AbstractDeclarationReferencer[ir_types.DeclaredTypeName]):
    def get_filepath(self, *, name: ir_types.DeclaredTypeName, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name=name.name.snake_case.safe_name),
        )

    def _get_directories_for_fern_filepath_part(
        self,
        *,
        fern_filepath_part: ir_types.Name,
        export_strategy: ExportStrategy,
        as_request: bool = False
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

    def get_class_name(self, *, name: ir_types.DeclaredTypeName) -> str:
        return name.name.pascal_case.safe_name
