from typing import Generic, Tuple, TypeVar, Union

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.utils import resolve_name

import fern.ir.resources as ir_types

T = TypeVar("T")


class SdkDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def __init__(self, *, skip_resources_module: bool) -> None:
        self.skip_resources_module = skip_resources_module

    def _get_directories_for_fern_filepath_part(
        self,
        *,
        fern_filepath_part: Union[str, ir_types.Name],
        export_strategy: ExportStrategy,
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        if self.skip_resources_module:
            return (
                Filepath.DirectoryFilepathPart(
                    module_name=resolve_name(fern_filepath_part).snake_case.safe_name,
                    export_strategy=export_strategy,
                ),
            )
        return (
            Filepath.DirectoryFilepathPart(
                module_name="resources",
                export_strategy=ExportStrategy(export_all=True),
            ),
            Filepath.DirectoryFilepathPart(
                module_name=resolve_name(fern_filepath_part).snake_case.safe_name,
                export_strategy=export_strategy,
            ),
        )
