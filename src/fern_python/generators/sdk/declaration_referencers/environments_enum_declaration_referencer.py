from fern_python.codegen import Filepath

from ..sdk_filepath_creator import SdkFilepathCreator
from .sdk_declaration_referencer import SdkDeclarationReferencer


class EnvironmentsEnumDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, filepath_creator: SdkFilepathCreator, client_class_name: str):
        super().__init__(filepath_creator=filepath_creator)
        self._client_class_name = client_class_name

    def get_filepath(self, *, name: None) -> Filepath:
        return Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name="environment"),
        )

    def get_class_name(self, *, name: None) -> str:
        return self._client_class_name + "Environment"
