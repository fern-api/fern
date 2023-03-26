from fern_python.codegen import ExportStrategy, Filepath

from ..sdk_filepath_creator import SdkFilepathCreator
from .sdk_declaration_referencer import SdkDeclarationReferencer


class RootClientDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, filepath_creator: SdkFilepathCreator, root_class_name: str):
        super().__init__(filepath_creator=filepath_creator)
        self._root_class_name = root_class_name

    def get_filepath(self, *, name: None) -> Filepath:
        return Filepath(
            directories=self._filepath_creator.generate_filepath_prefix()
            + (
                Filepath.DirectoryFilepathPart(
                    module_name="client",
                    export_strategy=ExportStrategy(export_all=True),
                ),
            ),
            file=Filepath.FilepathPart(module_name="client"),
        )

    def get_class_name(self, *, name: None) -> str:
        return self._root_class_name
