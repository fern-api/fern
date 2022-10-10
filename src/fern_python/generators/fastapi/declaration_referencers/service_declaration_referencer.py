import fern.ir.pydantic as ir_types

from fern_python.codegen import Filepath

from .fastapi_declaration_referencer import FastApiDeclarationReferencer


class ServiceDeclarationReferencer(FastApiDeclarationReferencer[ir_types.services.DeclaredServiceName]):
    def get_filepath(self, *, name: ir_types.services.DeclaredServiceName) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name="service"),
        )

    def get_class_name(self, *, name: ir_types.services.DeclaredServiceName) -> str:
        return f"Abstract{name.name}"
