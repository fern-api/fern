from typing import Callable, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, Filepath
from src.fern_python.codegen.ast.references import ClassReference

from .sdk_declaration_referencer import SdkDeclarationReferencer


class SubpackageClientDeclarationReferencer(SdkDeclarationReferencer[ir_types.Subpackage]):
    def get_filepath(self, *, name: ir_types.Subpackage, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            ),
            file=Filepath.FilepathPart(module_name="client"),
        )

    def get_class_name(self, *, name: ir_types.Subpackage, as_request: bool = False) -> str:
        return name.name.pascal_case.unsafe_name + "Client"
