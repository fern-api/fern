from .sdk_declaration_referencer import SdkDeclarationReferencer

from fern_python.codegen import Filepath


class RootAsyncRawClientDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, client_class_name: str, client_filename: str, skip_resources_module: bool):
        super().__init__(skip_resources_module=skip_resources_module)
        self._client_class_name = client_class_name
        self._client_filename = client_filename

    def get_filepath(self, *, name: None, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=(),
            # the [:-3] removes the .py extension
            file=Filepath.FilepathPart(module_name="raw_" + self._client_filename[:-3]),
        )

    def get_class_name(self, *, name: None, as_request: bool = False) -> str:
        return "AsyncRaw" + self._client_class_name
