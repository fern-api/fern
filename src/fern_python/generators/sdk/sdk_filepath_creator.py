from typing import List

import fern.ir.pydantic as ir_types
from fern.generator_exec.sdk.resources import GeneratorConfig

from fern_python.declaration_referencer import FernFilepathCreator


class SdkFilepathCreator(FernFilepathCreator):
    def __init__(
        self,
        *,
        folders_inside_src: List[str],
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ):
        super().__init__(ir=ir, generator_config=generator_config)
        self._folders_inside_src = folders_inside_src

    def _get_folders_inside_src(self) -> List[str]:
        return self._folders_inside_src
