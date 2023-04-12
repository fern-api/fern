from typing import Tuple

import fern.ir.pydantic as ir_types
from fern.generator_exec.sdk.resources import GeneratorConfig

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.declaration_referencer import FernFilepathCreator

from .custom_config import SDKCustomConfig


class SdkFilepathCreator(FernFilepathCreator):
    def __init__(
        self, ir: ir_types.IntermediateRepresentation, generator_config: GeneratorConfig, custom_config: SDKCustomConfig
    ):
        super().__init__(ir=ir, generator_config=generator_config)
        self._custom_config = custom_config

    def _get_filepath_prefix_for_published_package(self) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            (
                Filepath.DirectoryFilepathPart(
                    module_name=self._ir.api_name.snake_case.unsafe_name,
                    export_strategy=ExportStrategy(export_all=True),
                ),
            )
            if self._custom_config.use_api_name_in_package
            else ()
        )
