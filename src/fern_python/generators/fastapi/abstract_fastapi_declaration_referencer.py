from typing import Generic, Tuple, TypeVar

from generator_exec.resources.config import GeneratorConfig

from fern_python.codegen import Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generated import ir_types

T = TypeVar("T")


class AbstractFastApiDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def __init__(self, generator_config: GeneratorConfig, ir: ir_types.IntermediateRepresentation):
        super().__init__()
        self._generator_config = generator_config
        self._ir = ir

    def _get_directories_for_fern_filepath(
        self,
        *,
        fern_filepath: ir_types.FernFilepath,
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        default_directories = super()._get_directories_for_fern_filepath(fern_filepath=fern_filepath)
        return self._generator_config.output.mode.visit(
            download_files=lambda: default_directories,
            publish=lambda x: (
                Filepath.DirectoryFilepathPart(module_name=self._generator_config.organization),
                Filepath.DirectoryFilepathPart(module_name=self._ir.api_name),
            )
            + default_directories,
        )
