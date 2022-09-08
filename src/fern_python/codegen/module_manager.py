import os
from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Set, Tuple

from . import AST
from .filepath import ExportStrategy, Filepath
from .source_file import SourceFileImpl

RelativeModulePath = Tuple[str, ...]


@dataclass
class ModuleInfo:
    exports: DefaultDict[RelativeModulePath, Set[str]]


def create_empty_module_info() -> ModuleInfo:
    return ModuleInfo(exports=defaultdict(lambda: set()))


class ModuleManager:
    """
    A utility for managing the __init__.py files in a project
    """

    _module_infos: DefaultDict[AST.ModulePath, ModuleInfo] = defaultdict(create_empty_module_info)

    def register_source_file(self, filepath: Filepath, source_file: SourceFileImpl) -> None:
        exports = source_file.get_exports()
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
                module_info.exports[(".",)].update(exports)

            module_being_exported_from = exporting_module
            is_exporting_from_file = False

    def write_modules(self, filepath: str) -> None:
        for module, module_info in self._module_infos.items():
            with open(os.path.join(filepath, *module, "__init__.py"), "w") as f:
                all_exports: Set[str] = set()
                for exported_from, exports in module_info.exports.items():
                    if len(exports) > 0:
                        f.write(f"from .{'.'.join(exported_from)} import {', '.join(exports)}\n")
                        all_exports.update(exports)
                if len(all_exports) > 0:
                    f.write("__all__ = [" + ", ".join(f'"{export}"' for export in sorted(all_exports)) + "]")
