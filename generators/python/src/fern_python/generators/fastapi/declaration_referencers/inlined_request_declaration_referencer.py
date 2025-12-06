from dataclasses import dataclass

import fern.ir.resources as ir_types
from .fastapi_declaration_referencer import FastApiDeclarationReferencer
from .service_declaration_referencer import ServiceDeclarationReferencer

from fern_python.codegen import ExportStrategy, Filepath


@dataclass(frozen=True)
class ServiceNameAndInlinedRequestBody:
    service_name: ir_types.DeclaredServiceName
    request: ir_types.InlinedRequestBody


class InlinedRequestDeclarationReferencer(FastApiDeclarationReferencer[ServiceNameAndInlinedRequestBody]):
    def __init__(
        self,
        *,
        service_declaration_handler: ServiceDeclarationReferencer,
    ):
        super().__init__()
        self._service_declaration_referencer = service_declaration_handler

    def get_filepath(self, *, name: ServiceNameAndInlinedRequestBody, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._service_declaration_referencer._get_directories_for_service(
                name=name.service_name,
                service_directory_export_strategy=ExportStrategy(export_all=True),
            ),
            file=Filepath.FilepathPart(module_name=name.request.name.snake_case.unsafe_name),
        )

    def get_class_name(self, *, name: ServiceNameAndInlinedRequestBody, as_request: bool = False) -> str:
        return name.request.name.pascal_case.unsafe_name
