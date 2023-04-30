from typing import Tuple

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import FernFilepathCreator


class PydanticFilepathCreator(FernFilepathCreator):
    def _get_filepath_prefix_for_published_package(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            Filepath.DirectoryFilepathPart(
                module_name=self._ir.api_name.snake_case.unsafe_name,
                export_strategy=ExportStrategy(export_all=True),
            ),
        )
