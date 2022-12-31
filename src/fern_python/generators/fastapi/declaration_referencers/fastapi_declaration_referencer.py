from typing import Generic, Tuple, TypeVar

import fern.ir_v1.pydantic as ir_types

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from ..fastapi_filepath_creator import FastApiFilepathCreator

T = TypeVar("T")


class FastApiDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def __init__(self, filepath_creator: FastApiFilepathCreator):
        super().__init__(filepath_creator=filepath_creator)

    def _get_generator_name_for_containing_folder(self) -> str:
        return "fastapi"

    def _get_directories_for_fern_filepath(
        self,
        *,
        fern_filepath: ir_types.FernFilepath,
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            Filepath.DirectoryFilepathPart(
                module_name="resources",
                export_strategy=ExportStrategy.EXPORT_ALL,
            ),
        ) + super()._get_directories_for_fern_filepath(fern_filepath=fern_filepath)
