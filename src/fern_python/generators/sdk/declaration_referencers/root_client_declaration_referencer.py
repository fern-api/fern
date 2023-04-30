from fern_python.codegen import Filepath

from .sdk_declaration_referencer import SdkDeclarationReferencer


class RootClientDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, root_class_name: str):
        super().__init__()
        self._root_class_name = root_class_name

    def get_filepath(self, *, name: None) -> Filepath:
        return Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name="client"),
        )

    def get_class_name(self, *, name: None) -> str:
        return self._root_class_name
