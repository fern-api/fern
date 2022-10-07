from fern_python.codegen import Filepath
from fern_python.generated import ir_types

from .get_directories_for_fern_filepath import get_directories_for_fern_filepath


def get_filepath_for_type(type_name: ir_types.DeclaredTypeName, api_name: str) -> Filepath:
    return Filepath(
        directories=get_directories_for_fern_filepath(
            api_name=api_name,
            fern_filepath=type_name.fern_filepath,
        ),
        file=Filepath.FilepathPart(module_name=type_name.name_v_2.snake_case),
    )
