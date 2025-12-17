from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional, Tuple

from . import AST


@dataclass(frozen=True)
class ExportStrategy:
    export_all: bool = False
    export_as_namespace: bool = False


@dataclass(frozen=True)
class Filepath:
    directories: Tuple[DirectoryFilepathPart, ...]
    file: FilepathPart

    def to_module(self) -> AST.Module:
        # Filter out empty or underscore-only module names from directories to avoid invalid imports like "._.types"
        # Always include the file part (it's the actual file name)
        module_names = [
            part.module_name
            for part in self.directories
            if part.module_name and part.module_name != "_"
        ]
        # Always include the file part
        if self.file.module_name:
            module_names.append(self.file.module_name)
        return AST.Module.local(*module_names)

    def __str__(self) -> str:
        # Filter out empty or underscore-only module names from directories
        parts = [dir.module_name for dir in self.directories if dir.module_name and dir.module_name != "_"]
        # Always include the file part
        if self.file.module_name:
            parts.append(self.file.module_name + ".py")
        return os.path.join(*parts)

    @dataclass(frozen=True)
    class FilepathPart:
        module_name: str

    @dataclass(frozen=True)
    class DirectoryFilepathPart(FilepathPart):
        # how this directory should be exported in its parent's __init__.py
        export_strategy: Optional[ExportStrategy] = None
