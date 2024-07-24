import fern.ir.resources as ir_types

from fern_python.codegen import ExportStrategy, Filepath

from .sdk_declaration_referencer import SdkDeclarationReferencer


class TypeDeclarationReferencer(SdkDeclarationReferencer[ir_types.DeclaredTypeName]):
    def get_filepath(self, *, name: ir_types.DeclaredTypeName, as_request: bool = False) -> Filepath:
        should_use_request_dir = self.use_typeddict_requests and as_request
        return Filepath(
            directories=self._get_directories_for_fern_filepath(
                fern_filepath=name.fern_filepath,
            )
            + (
                Filepath.DirectoryFilepathPart(
                    module_name=("requests" if should_use_request_dir else "types"),
                    export_strategy=ExportStrategy(export_all=True),
                ),
            ),
            file=Filepath.FilepathPart(module_name=name.name.snake_case.safe_name),
        )

    def get_class_name(self, *, name: ir_types.DeclaredTypeName, as_request: bool = False) -> str:
        class_name = name.name.pascal_case.safe_name
        return f"{class_name}Params" if as_request else class_name
