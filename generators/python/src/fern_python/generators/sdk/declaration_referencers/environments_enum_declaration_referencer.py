from .sdk_declaration_referencer import SdkDeclarationReferencer
from fern_python.codegen import Filepath


class EnvironmentsEnumDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, environment_class_name: str, skip_resources_module: bool):
        super().__init__(skip_resources_module=skip_resources_module)
        self._environment_class_name = environment_class_name

    def get_filepath(self, *, name: None, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name="environment"),
        )

    def get_class_name(self, *, name: None, as_request: bool = False) -> str:
        return self._environment_class_name
