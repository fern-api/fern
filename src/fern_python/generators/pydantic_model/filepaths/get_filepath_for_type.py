import re

from fern_python.codegen import Filepath
from fern_python.generated import ir_types

from .get_directories_for_fern_filepath import get_directories_for_fern_filepath


def get_filepath_for_type(type_name: ir_types.DeclaredTypeName, api_name: str) -> Filepath:
    return Filepath(
        directories=get_directories_for_fern_filepath(
            api_name=api_name,
            fern_filepath=type_name.fern_filepath,
        ),
        file=Filepath.FilepathPart(module_name=convert_camel_case_to_snake_case(type_name.name)),
    )


# https://stackoverflow.com/questions/1175208/elegant-python-function-to-convert-camelcase-to-snake-case
pattern = re.compile(r"(?<!^)(?=[A-Z])")


def convert_camel_case_to_snake_case(camel_case: str) -> str:
    return pattern.sub("_", camel_case).lower()
