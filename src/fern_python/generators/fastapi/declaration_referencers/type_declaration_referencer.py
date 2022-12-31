import fern.ir_v1.pydantic as ir_types

from fern_python.codegen import ExportStrategy, Filepath

from .fastapi_declaration_referencer import FastApiDeclarationReferencer


class TypeDeclarationReferencer(FastApiDeclarationReferencer[ir_types.DeclaredTypeName]):
    def get_filepath(self, *, name: ir_types.DeclaredTypeName) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            )
            + (
                Filepath.DirectoryFilepathPart(
                    module_name="types",
                    export_strategy=ExportStrategy.EXPORT_ALL,
                ),
            ),
            file=Filepath.FilepathPart(module_name=name.name_v_2.snake_case),
        )

    def get_class_name(self, *, name: ir_types.DeclaredTypeName) -> str:
        return name.name
