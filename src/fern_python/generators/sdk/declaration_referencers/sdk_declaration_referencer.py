from typing import Generic, Tuple, TypeVar

import fern.ir.pydantic as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from ..sdk_filepath_creator import SdkFilepathCreator

T = TypeVar("T")


class SdkDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def __init__(self, filepath_creator: SdkFilepathCreator):
        super().__init__(filepath_creator=filepath_creator)

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
