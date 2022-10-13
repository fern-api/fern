import os
from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Set, Tuple

from . import AST
from .filepath import ExportStrategy, Filepath
from .writer_impl import WriterImpl

RelativeModulePath = Tuple[str, ...]


@dataclass
class ModuleInfo:
    exports: DefaultDict[RelativeModulePath, Set[str]]


def create_empty_module_info() -> ModuleInfo:
    return ModuleInfo(exports=defaultdict(set))


class ModuleManager:
    """
    A utility for managing the __init__.py files in a project
    """

    _module_infos: DefaultDict[AST.ModulePath, ModuleInfo]

    def __init__(self) -> None:
        self._module_infos = defaultdict(create_empty_module_info)

    def register_exports(self, filepath: Filepath, exports: Set[str]) -> None:
        module_being_exported_from: AST.ModulePath = tuple(
            directory.module_name for directory in filepath.directories
        ) + (filepath.file.module_name,)

        is_exporting_from_file = True

        while len(module_being_exported_from) > 0:
            relative_module_being_exported_from = module_being_exported_from[-1:]
            exporting_module = module_being_exported_from[:-1]
            module_info = self._module_infos[exporting_module]
            export_strategy = (
                ExportStrategy.EXPORT_ALL
                if is_exporting_from_file
                else filepath.directories[len(module_being_exported_from) - 1].export_strategy
            )

            if export_strategy is None:
                exports = set()
            elif export_strategy == ExportStrategy.EXPORT_ALL:
                module_info.exports[relative_module_being_exported_from].update(exports)
            elif export_strategy == ExportStrategy.EXPORT_AS_NAMESPACE:
                exports = set(relative_module_being_exported_from)
                module_info.exports[()].update(exports)

            module_being_exported_from = exporting_module
            is_exporting_from_file = False

    def write_modules(self, filepath: str) -> None:
        for module, module_info in self._module_infos.items():
            with WriterImpl(filepath=os.path.join(filepath, *module, "__init__.py")) as writer:
                all_exports: Set[str] = set()
                for exported_from, exports in module_info.exports.items():
                    if len(exports) > 0:
                        writer.write_line(f"from .{'.'.join(exported_from)} import {', '.join(exports)}")
                        all_exports.update(exports)
                if len(all_exports) > 0:
                    writer.write_line("__all__ = [" + ", ".join(f'"{export}"' for export in sorted(all_exports)) + "]")
