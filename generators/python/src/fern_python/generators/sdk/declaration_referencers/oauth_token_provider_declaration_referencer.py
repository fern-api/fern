from .sdk_declaration_referencer import SdkDeclarationReferencer

from fern_python.codegen import Filepath


class OAuthTokenProviderDeclarationReferencer(SdkDeclarationReferencer[None]):
    def __init__(self, client_class_name: str, client_filename: str, skip_resources_module: bool):
        super().__init__(skip_resources_module=skip_resources_module)
        self._client_class_name = client_class_name
        self._client_filename = client_filename

    def get_filepath(self, *, name: None, as_request: bool = False) -> Filepath:
        return Filepath(
            directories=(Filepath.DirectoryFilepathPart(module_name="core"),),
            file=Filepath.FilepathPart(module_name="oauth_token_provider"),
        )

    def get_class_name(self, *, name: None, as_request: bool = False) -> str:
        return self._client_class_name
