import ir as ir_types

from fern_python.codegen import Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer


class TypeDeclarationReferencer(AbstractDeclarationReferencer[ir_types.DeclaredTypeName]):
    def get_filepath(self, *, name: ir_types.DeclaredTypeName) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name=name.name_v_2.snake_case),
        )

    def get_class_name(self, *, name: ir_types.DeclaredTypeName) -> str:
        return name.name

    def _get_generator_name_for_containing_folder(self) -> str:
        return "pydantic"
