from .sdk_declaration_referencer import SdkDeclarationReferencer
from fern_python.codegen import Filepath

import fern.ir.resources as ir_types


class SubpackageAsyncClientDeclarationReferencer(SdkDeclarationReferencer[ir_types.Subpackage]):
    def get_filepath(self, *, name: ir_types.Subpackage, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name="client"),
        )

    def get_class_name(self, *, name: ir_types.Subpackage, as_request: bool = False) -> str:
        return "Async" + name.name.pascal_case.unsafe_name + "Client"
