from abc import ABC

from fern_python.codegen import SourceFile


class File(ABC):
    source_file: SourceFile
