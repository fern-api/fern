import os
from collections import defaultdict
from dataclasses import dataclass
from functools import cmp_to_key
from typing import DefaultDict, List, Optional, Sequence, Set, Tuple

from . import AST
from .filepath import ExportStrategy, Filepath
from .writer_impl import WriterImpl

import pydantic

RelativeModulePath = Tuple[str, ...]


class ModuleExport(pydantic.BaseModel):
    from_: str = pydantic.Field(alias="from")
    imports: List[str]

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True


@dataclass
class ModuleInfo:
    exports: DefaultDict[RelativeModulePath, Set[str]]
    from_src: bool = True


def create_empty_module_info() -> ModuleInfo:
    return ModuleInfo(exports=defaultdict(set))


@dataclass
class ModuleExportsLine:
    exported_from: str
    exports: List[str]


def _format_submodule_import(*, export: str, module: str) -> str:
    if module == ".":
        return f".{export}"
    return module


def _write_dynamic_exports_dict(writer: AST.Writer, sorted_export_module_mapping: List[Tuple[str, str]]) -> None:
    writer.write_line(
        "_dynamic_imports: typing.Dict[str, str] = {"
        + ", ".join(
            f'"{export}": "{_format_submodule_import(export=export, module=module)}"'
            for export, module in sorted_export_module_mapping
        )
        + "}"
    )


def _write_attr_function(writer: AST.Writer) -> None:
    writer.write_line("def __getattr__(attr_name: str) -> typing.Any:")
    with writer.indent():
        writer.write_line("module_name = _dynamic_imports.get(attr_name)")
        writer.write_line("if module_name is None:")
        with writer.indent():
            writer.write_line(
                'raise AttributeError(f"No {attr_name} found in _dynamic_imports for module name -> {__name__}")'
            )

        writer.write_line("try:")
        with writer.indent():
            writer.write_line("module = import_module(module_name, __package__)")

            # Check if we're importing a submodule (pattern: attr "foo" maps to ".foo")
            writer.write_line('if module_name == f".{attr_name}":')
            with writer.indent():
                writer.write_line("return module")
            # Otherwise, return specific attribute from the module (like "from .module import Class")
            writer.write_line("else:")
            with writer.indent():
                writer.write_line("return getattr(module, attr_name)")

        writer.write_line("except ImportError as e:")
        with writer.indent():
            writer.write_line('raise ImportError(f"Failed to import {attr_name} from {module_name}: {e}") from e')
        writer.write_line("except AttributeError as e:")
        with writer.indent():
            writer.write_line('raise AttributeError(f"Failed to get {attr_name} from {module_name}: {e}") from e')


def _write_dir_func(writer: AST.Writer) -> None:
    writer.write_line("def __dir__():")
    with writer.indent():
        writer.write_line("lazy_attrs = list(_dynamic_imports.keys())")
        writer.write_line("return sorted(lazy_attrs)")


def _write_recursion_limit(writer: AST.Writer, recursion_limit: int) -> None:
    writer.write_line(f"if sys.getrecursionlimit() < {recursion_limit}:")
    with writer.indent():
        writer.write_line(f"sys.setrecursionlimit({recursion_limit})")


class ModuleManager:
    """
    A utility for managing the __init__.py files in a project
    """

    _module_infos: DefaultDict[AST.ModulePath, ModuleInfo]

    def __init__(
        self,
        *,
        sorted_modules: Optional[Sequence[str]] = None,
        lazy_imports: bool,
        recursion_limit: Optional[int] = None,
    ) -> None:
        self._module_infos = defaultdict(create_empty_module_info)
        self._sorted_modules = sorted_modules or []
        self._lazy_imports = lazy_imports
        self._recursion_limit = recursion_limit

    def register_additional_exports(self, path: AST.ModulePath, exports: List[ModuleExport]) -> None:
        for export in exports:
            self._module_infos[path].exports[(export.from_,)].update(export.imports)

    def register_exports(self, filepath: Filepath, exports: Set[str], from_src: Optional[bool] = True) -> None:
        module_being_exported_from: AST.ModulePath = tuple(
            directory.module_name for directory in filepath.directories
        ) + (filepath.file.module_name,)

        is_exporting_from_file = True

        while len(module_being_exported_from) > 0:
            relative_module_being_exported_from = module_being_exported_from[-1:]
            exporting_module = module_being_exported_from[:-1]
            module_info = self._module_infos[exporting_module]

            # This is a bit odd, but it stops from claiming the root level init.py lives outside src
            from_src = from_src if from_src is not None and len(module_being_exported_from) > 1 else True
            module_info.from_src = from_src
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

    def write_modules(self, base_filepath: str, filepath: str) -> None:
        for module, module_info in self._module_infos.items():
            writer = WriterImpl(
                # will be formatted at the end via ruff
                should_format=False,
                # don't sort imports in __init__.py because the import order is
                # controlled to avoid issues with circular imports
                should_sort_imports=False,
            )

            sorted_exports = self._build_sorted_exports(module_info)
            all_exports = {
                export: module_exports_line.exported_from
                for module_exports_line in sorted_exports
                for export in module_exports_line.exports
            }
            sorted_export_module_mapping = sorted(all_exports.items())

            # Write preamble for root module (empty tuple)
            recursion_limit_to_write = self._recursion_limit if len(module) == 0 else None

            if len(sorted_export_module_mapping) > 0 and self._lazy_imports:
                if recursion_limit_to_write is not None:
                    writer.write_line("import sys")
                writer.write_line("import typing")
                writer.write_line("from importlib import import_module")
                if recursion_limit_to_write is not None:
                    _write_recursion_limit(writer, recursion_limit_to_write)

                # We only import the modules if we're in a type-checking context.
                writer.write_line("if typing.TYPE_CHECKING:")
                with writer.indent():
                    self._write_imports(writer, sorted_exports)

                _write_dynamic_exports_dict(writer, sorted_export_module_mapping)
                _write_attr_function(writer)
                _write_dir_func(writer)

            else:
                if recursion_limit_to_write is not None:
                    writer.write_line("import sys")
                    _write_recursion_limit(writer, recursion_limit_to_write)
                self._write_imports(writer, sorted_exports)

            if len(sorted_export_module_mapping) > 0:
                writer.write_line(
                    "__all__ = [" + ", ".join(f'"{export}"' for export, _ in sorted_export_module_mapping) + "]"
                )
            writer.write_to_file(
                os.path.join(filepath if module_info.from_src else base_filepath, *module, "__init__.py")
            )

    def _write_imports(self, writer: WriterImpl, sorted_exports: List[ModuleExportsLine]) -> None:
        for module_exports_line in sorted_exports:
            if len(module_exports_line.exports) > 0:
                writer.write_line(
                    f"from {module_exports_line.exported_from} import {', '.join(module_exports_line.exports)}"
                )

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
