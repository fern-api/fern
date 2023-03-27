from abc import ABC
from typing import Tuple

import fern.ir.pydantic as ir_types
from fern.generator_exec.sdk.resources import GeneratorConfig

from fern_python.codegen import ExportStrategy, Filepath

EMPTY_DIRECTORIES: Tuple[Filepath.DirectoryFilepathPart, ...] = ()


class FernFilepathCreator(ABC):
    def __init__(self, ir: ir_types.IntermediateRepresentation, generator_config: GeneratorConfig):
        self._ir = ir
        self._generator_config = generator_config

    def generate_filepath_prefix(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return self._generator_config.output.mode.visit(
            download_files=lambda: EMPTY_DIRECTORIES,
            publish=lambda x: self._get_filepath_prefix_for_published_package(),
            github=lambda x: self._get_filepath_prefix_for_published_package(),
        )

    def _get_filepath_prefix_for_published_package(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            Filepath.DirectoryFilepathPart(
                module_name=self._ir.api_name.snake_case.unsafe_name,
                export_strategy=ExportStrategy(export_all=True),
            ),
        )
