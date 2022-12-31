from abc import ABC, abstractmethod
from typing import Tuple

import fern.ir_v1.pydantic as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.codegen import ExportStrategy, Filepath

EMPTY_DIRECTORIES: Tuple[Filepath.DirectoryFilepathPart, ...] = ()


class FernFilepathCreator(ABC):
    def __init__(self, ir: ir_types.IntermediateRepresentation, generator_config: GeneratorConfig):
        self._ir = ir
        self._generator_config = generator_config

    def generate_filepath_prefix(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return self._generator_config.output.mode.visit(
            download_files=lambda: EMPTY_DIRECTORIES,
            publish=lambda x: (
                Filepath.DirectoryFilepathPart(
                    module_name=self._ir.api_name, export_strategy=ExportStrategy.EXPORT_ALL
                ),
                Filepath.DirectoryFilepathPart(
                    module_name=self._get_generator_name_for_containing_folder(),
                    export_strategy=ExportStrategy.EXPORT_ALL,
                ),
            ),
        )

    @abstractmethod
    def _get_generator_name_for_containing_folder(self) -> str:
        ...
