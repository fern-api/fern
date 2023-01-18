from dataclasses import dataclass

import fern.ir.pydantic as ir_types

from fern_python.codegen import Filepath

from ..fastapi_filepath_creator import FastApiFilepathCreator
from .fastapi_declaration_referencer import FastApiDeclarationReferencer
from .service_declaration_referencer import ServiceDeclarationReferencer


@dataclass(frozen=True)
class ServiceNameAndInlinedRequestBody:
    service_name: ir_types.DeclaredServiceName
    request: ir_types.InlinedRequestBody


class InlinedRequestDeclarationReferencer(FastApiDeclarationReferencer[ServiceNameAndInlinedRequestBody]):
    def __init__(
        self,
        *,
        filepath_creator: FastApiFilepathCreator,
        service_declaration_handler: ServiceDeclarationReferencer,
    ):
        super().__init__(filepath_creator=filepath_creator)
        self._service_declaration_handler = service_declaration_handler

    def get_filepath(
        self,
        *,
        name: ServiceNameAndInlinedRequestBody,
    ) -> Filepath:
        return Filepath(
            directories=self._service_declaration_handler.get_filepath(name=name.service_name).directories,
            file=Filepath.FilepathPart(module_name=name.request.name.snake_case.unsafe_name),
        )

    def get_class_name(self, *, name: ServiceNameAndInlinedRequestBody) -> str:
        return name.request.name.original_name
