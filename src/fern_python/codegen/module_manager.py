import os
from collections import defaultdict
from dataclasses import dataclass
from functools import cmp_to_key
from typing import DefaultDict, List, Optional, Sequence, Set, Tuple

from . import AST
from .filepath import ExportStrategy, Filepath
from .writer_impl import WriterImpl

RelativeModulePath = Tuple[str, ...]


@dataclass
class ModuleInfo:
    exports: DefaultDict[RelativeModulePath, Set[str]]


def create_empty_module_info() -> ModuleInfo:
    return ModuleInfo(exports=defaultdict(set))


@dataclass
class ModuleExportsLine:
    exported_from: str
    exports: List[str]


class ModuleManager:
    """
    A utility for managing the __init__.py files in a project
    """

    _module_infos: DefaultDict[AST.ModulePath, ModuleInfo]

    def __init__(self, *, should_format: bool, sorted_modules: Optional[Sequence[str]] = None) -> None:
        self._module_infos = defaultdict(create_empty_module_info)
        self._should_format = should_format
        self._sorted_modules = sorted_modules or []

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
                ExportStrategy(export_all=True)
                if is_exporting_from_file
                else filepath.directories[len(module_being_exported_from) - 1].export_strategy
            )

            # this shouldn't happen but is necessary to appease mypy
            if export_strategy is None:
                break

            new_exports = set()
            if export_strategy.export_all:
                new_exports.update(exports)
                module_info.exports[relative_module_being_exported_from].update(exports)
            if export_strategy.export_as_namespace:
                namespace_export = set(relative_module_being_exported_from)
                module_info.exports[()].update(namespace_export)
                new_exports.update(namespace_export)
            exports = new_exports

            module_being_exported_from = exporting_module
            is_exporting_from_file = False

    def write_modules(self, filepath: str) -> None:
        for module, module_info in self._module_infos.items():
            writer = WriterImpl(
                should_format=self._should_format,
                # don't sort imports in __init__.py because the import order is
                # controlled to avoid issues with circular imports
                should_sort_imports=False,
            )
            all_exports: Set[str] = set()
            for module_exports_line in self._build_sorted_exports(module_info):
                if len(module_exports_line.exports) > 0:
                    writer.write_line(
                        f"from {module_exports_line.exported_from} import {', '.join(module_exports_line.exports)}"
                    )
                    all_exports.update(module_exports_line.exports)
            if len(all_exports) > 0:
                writer.write_line("__all__ = [" + ", ".join(f'"{export}"' for export in sorted(all_exports)) + "]")
            writer.write_to_file(os.path.join(filepath, *module, "__init__.py"))

    def _build_sorted_exports(self, module_info: ModuleInfo) -> List[ModuleExportsLine]:
        modules = [
            ModuleExportsLine(exported_from=f".{'.'.join(exported_from)}", exports=sorted(exports))
            for exported_from, exports in module_info.exports.items()
        ]
        return sorted(modules, key=cmp_to_key(self._compare_modules_for_sorting))

    def _compare_modules_for_sorting(self, a: ModuleExportsLine, b: ModuleExportsLine) -> int:
        for module in self._sorted_modules:
            if a.exported_from.startswith(module):
                return -1
            if b.exported_from.startswith(module):
                return 1
        return -1 if a.exported_from < b.exported_from else 1
