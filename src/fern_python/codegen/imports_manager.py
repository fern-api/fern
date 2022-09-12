from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Optional, Set

from . import AST


@dataclass(frozen=True)
class SubmoduleImport:
    name: str
    alias: Optional[str]


@dataclass(frozen=True)
class DirectModuleImport:
    alias: Optional[str]


@dataclass
class ModuleImports:
    direct_module_imports: Set[DirectModuleImport]
    submodules: Set[SubmoduleImport]


Imports = DefaultDict[AST.ModulePath, ModuleImports]


def create_empty_module_imports() -> ModuleImports:
    return ModuleImports(direct_module_imports=set(), submodules=set())


class ImportsManager:
    _top_imports: Imports = defaultdict(create_empty_module_imports)
    _bottom_imports: Imports = defaultdict(create_empty_module_imports)

    def register_import(self, reference: AST.Reference) -> None:
        if reference.at_bottom_of_file:
            self._register_import(reference=reference, imports=self._bottom_imports)
        else:
            self._register_import(reference=reference, imports=self._top_imports)

    def write_top_imports(self, writer: AST.Writer) -> None:
        self._write_imports(writer=writer, imports=self._top_imports)

    def write_bottom_imports(self, writer: AST.Writer) -> None:
        self._write_imports(writer=writer, imports=self._bottom_imports)

    def _write_imports(self, writer: AST.Writer, imports: Imports) -> None:
        for module_name, import_to_write in imports.items():
            for direct_module_import in import_to_write.direct_module_imports:
                line = f"import {module_name}"
                if direct_module_import.alias is not None:
                    line += f" as {direct_module_import.alias}"
                writer.write_line(line)
            if len(import_to_write.submodules) > 0:
                submodule_imports = ", ".join(map(stringify_submodule_import, import_to_write.submodules))
                writer.write_line(f"from {module_name} import {submodule_imports}")

    def _register_import(self, reference: AST.Reference, imports: Imports) -> None:
        if reference.submodule is None:
            imports[reference.module].direct_module_imports.add(DirectModuleImport(alias=reference.alias))
        else:
            imports[reference.module].submodules.add(SubmoduleImport(name=reference.submodule, alias=reference.alias))


def stringify_submodule_import(submodule_import: SubmoduleImport) -> str:
    if submodule_import.alias is None:
        return submodule_import.name
    else:
        return f"{submodule_import.name} as {submodule_import.alias}"
