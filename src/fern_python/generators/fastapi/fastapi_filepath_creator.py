from fern_python.declaration_referencer import FernFilepathCreator


class FastApiFilepathCreator(FernFilepathCreator):
    def _get_generator_name_for_containing_folder(self) -> str:
        return "fastapi"
