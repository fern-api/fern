from __future__ import annotations

import os
import shutil
from types import TracebackType
from typing import Generator, Optional, Type

from . import AST
from .filepath import Filepath
from .module_manager import ModuleManager
from .source_file import SourceFile, SourceFileImpl


class Project:
    """
    with Project("/path/to/project") as project:
        ...
    """

    _filepath: str
    _root_module: str
    _module_manager = ModuleManager()

    def __init__(self, filepath: str):
        self._filepath = filepath
        self._root_module = os.path.basename(filepath)
        if os.path.exists(filepath):
            shutil.rmtree(filepath)

    def source_file(self, filepath: Filepath) -> SourceFile:
        """
        with project.source_file() as source_file:
            ...
        """

        def on_finish(source_file: SourceFileImpl) -> None:
            self._module_manager.register_source_file(
                filepath=filepath,
                source_file=source_file,
            )

        module_path = convert_filepath_to_module_path(filepath)
        source_file = SourceFileImpl(
            filepath=os.path.join(
                self._filepath,
                *(directory.module_name for directory in filepath.directories),
                f"{filepath.file.module_name}.py",
            ),
            module_path=module_path,
            completion_listener=on_finish,
        )
        return source_file

    def finish(self) -> None:
        self._module_manager.write_modules(filepath=self._filepath)

    def __enter__(self) -> Project:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()


def convert_filepath_to_module_path(filepath: Filepath) -> AST.ModulePath:
    return tuple(get_module_names_from_filepath(filepath))


def get_module_names_from_filepath(filepath: Filepath) -> Generator[str, None, None]:
    for directory in filepath.directories:
        yield directory.module_name
    yield filepath.file.module_name
