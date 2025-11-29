import fern.ir.resources as ir_types
from .fastapi_declaration_referencer import FastApiDeclarationReferencer

from fern_python.codegen import ExportStrategy, Filepath


class ErrorDeclarationReferencer(FastApiDeclarationReferencer[ir_types.DeclaredErrorName]):
    def get_filepath(self, *, name: ir_types.DeclaredErrorName, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            )
            + (
                Filepath.DirectoryFilepathPart(
                    module_name="errors",
                    export_strategy=ExportStrategy(export_all=True),
                ),
            ),
            file=Filepath.FilepathPart(module_name=name.name.snake_case.unsafe_name),
        )

    def get_class_name(self, *, name: ir_types.DeclaredErrorName, as_request: bool = False) -> str:
        return name.name.pascal_case.unsafe_name
