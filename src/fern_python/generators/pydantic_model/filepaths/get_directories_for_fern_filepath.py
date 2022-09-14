from typing import Tuple

from fern_python.codegen import ExportStrategy, Filepath
from fern_python.generated import ir_types


def get_directories_for_fern_filepath(
    api_name: str, fern_filepath: ir_types.FernFilepath
) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
    return tuple(
        Filepath.DirectoryFilepathPart(
            module_name=fern_filepath_part.camel_case,
            export_strategy=ExportStrategy.EXPORT_AS_NAMESPACE
            if i < len(fern_filepath) - 1
            else ExportStrategy.EXPORT_ALL,
        )
        for i, fern_filepath_part in enumerate(fern_filepath)
    )
