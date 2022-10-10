import fern.ir.pydantic as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.codegen import Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from .pydantic_filepath_creator import PydanticFilepathCreator


class TypeDeclarationReferencer(AbstractDeclarationReferencer[ir_types.DeclaredTypeName]):
    def __init__(self, ir: ir_types.IntermediateRepresentation, generator_config: GeneratorConfig):
        super().__init__(filepath_creator=PydanticFilepathCreator(ir=ir, generator_config=generator_config))

    def get_filepath(self, *, name: ir_types.DeclaredTypeName) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name=name.name_v_2.snake_case),
        )

    def get_class_name(self, *, name: ir_types.DeclaredTypeName) -> str:
        return name.name
