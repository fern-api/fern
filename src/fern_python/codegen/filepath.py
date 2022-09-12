from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional, Tuple


class ExportStrategy(Enum):
    EXPORT_ALL = auto()
    EXPORT_AS_NAMESPACE = auto()


@dataclass(frozen=True)
class Filepath:
    directories: Tuple[DirectoryFilepathPart, ...]
    file: FilepathPart

    @dataclass(frozen=True)
    class FilepathPart:
        module_name: str

    @dataclass(frozen=True)
    class DirectoryFilepathPart(FilepathPart):
        export_strategy: Optional[ExportStrategy] = None
