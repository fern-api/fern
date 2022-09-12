from abc import ABC
from dataclasses import dataclass

from fern_python.codegen import SourceFile


@dataclass
class DeclarationHandlerContext(ABC):
    source_file: SourceFile
