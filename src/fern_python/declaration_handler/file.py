from abc import ABC

from ..codegen import SourceFile


class File(ABC):
    source_file: SourceFile
