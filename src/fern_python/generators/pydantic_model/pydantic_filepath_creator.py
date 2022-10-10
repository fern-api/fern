from fern_python.declaration_referencer import FernFilepathCreator


class PydanticFilepathCreator(FernFilepathCreator):
    def _get_generator_name_for_containing_folder(self) -> str:
        return "pydantic"
