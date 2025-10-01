from typing import Generic, Tuple, TypeVar

import fern.ir.resources as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

T = TypeVar("T")


class FastApiDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def _get_directories_for_fern_filepath_part(
        self,
        *,
        fern_filepath_part: ir_types.Name,
        export_strategy: ExportStrategy,
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            Filepath.DirectoryFilepathPart(
                module_name="resources",
                export_strategy=ExportStrategy(export_all=True),
            ),
            Filepath.DirectoryFilepathPart(
                module_name=fern_filepath_part.snake_case.unsafe_name,
                export_strategy=export_strategy,
            ),
        )
