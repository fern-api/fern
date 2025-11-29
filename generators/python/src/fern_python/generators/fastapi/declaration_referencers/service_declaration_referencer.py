from typing import Optional, Tuple

import fern.ir.resources as ir_types
from .fastapi_declaration_referencer import FastApiDeclarationReferencer

from fern_python.codegen import ExportStrategy, Filepath


class ServiceDeclarationReferencer(FastApiDeclarationReferencer[ir_types.http.DeclaredServiceName]):
    def get_filepath(self, *, name: ir_types.DeclaredServiceName, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_service(
                name=name,
                service_directory_export_strategy=None,
            ),
            file=Filepath.FilepathPart(module_name="service"),
        )

    def _get_directories_for_service(
        self,
        *,
        name: ir_types.DeclaredServiceName,
        service_directory_export_strategy: Optional[ExportStrategy],
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        return (
            *self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            Filepath.DirectoryFilepathPart(
                module_name="service",
                export_strategy=service_directory_export_strategy,
            ),
        )

    def get_class_name(self, *, name: ir_types.DeclaredServiceName, as_request: bool = False) -> str:
        joined_path = (
            "".join([part.pascal_case.unsafe_name for part in name.fern_filepath.all_parts])
            if len(name.fern_filepath.all_parts) > 0
            else "Root"
        )
        return f"Abstract{joined_path}Service"
