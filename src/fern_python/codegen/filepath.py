from __future__ import annotations

import os
from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional, Tuple

from . import AST


class ExportStrategy(Enum):
    EXPORT_ALL = auto()
    EXPORT_AS_NAMESPACE = auto()


@dataclass(frozen=True)
class Filepath:
    directories: Tuple[DirectoryFilepathPart, ...]
    file: FilepathPart

    def to_module(self) -> AST.Module:
        return AST.Module.local(*(part.module_name for part in self.directories + (self.file,)))

    def __str__(self) -> str:
        parts = [dir.module_name for dir in self.directories]
        parts.append(self.file.module_name + ".py")
        return os.path.join(*parts)

    @dataclass(frozen=True)
    class FilepathPart:
        module_name: str

    @dataclass(frozen=True)
    class DirectoryFilepathPart(FilepathPart):
        export_strategy: Optional[ExportStrategy] = None
