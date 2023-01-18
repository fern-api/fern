import fern.ir.pydantic as ir_types

from fern_python.codegen import ExportStrategy, Filepath

from .fastapi_declaration_referencer import FastApiDeclarationReferencer


class ServiceDeclarationReferencer(FastApiDeclarationReferencer[ir_types.http.DeclaredServiceName]):
    def get_filepath(self, *, name: ir_types.DeclaredServiceName) -> Filepath:
        return Filepath(
            directories=(
                *self._get_directories_for_fern_filepath(
                    fern_filepath=name.fern_filepath,
                ),
                Filepath.DirectoryFilepathPart(module_name="service", export_strategy=ExportStrategy.EXPORT_ALL),
            ),
            file=Filepath.FilepathPart(module_name="service"),
        )

    def get_class_name(self, *, name: ir_types.DeclaredServiceName) -> str:
        return f"Abstract{name.name.original_name}"
