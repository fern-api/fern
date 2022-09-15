from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Optional, Set

from . import AST


@dataclass(frozen=True)
class NamedImport:
    name: str
    alias: Optional[str]


@dataclass(frozen=True)
class DirectModuleImport:
    alias: Optional[str]


@dataclass
class ModuleImports:
    direct_module_imports: Set[DirectModuleImport]
    named_imports: Set[NamedImport]


Imports = DefaultDict[AST.ModulePath, ModuleImports]


def create_empty_module_imports() -> ModuleImports:
    return ModuleImports(direct_module_imports=set(), named_imports=set())


class ImportsManager:
    def __init__(self) -> None:
        self._top_imports: Imports = defaultdict(create_empty_module_imports)
        self._bottom_imports: Imports = defaultdict(create_empty_module_imports)

    def register_import(self, reference_import: AST.ReferenceImport) -> None:
        if reference_import.at_bottom_of_file:
            self._register_import(reference_import=reference_import, imports=self._bottom_imports)
        else:
            self._register_import(reference_import=reference_import, imports=self._top_imports)

    def write_top_imports(self, writer: AST.Writer) -> None:
        self._write_imports(writer=writer, imports=self._top_imports)

    def write_bottom_imports(self, writer: AST.Writer) -> None:
        self._write_imports(writer=writer, imports=self._bottom_imports)

    def _write_imports(self, writer: AST.Writer, imports: Imports) -> None:
        for module_name, import_to_write in imports.items():
            stringified_module_name = ".".join(module_name)
            for direct_module_import in import_to_write.direct_module_imports:
                line = f"import {stringified_module_name}"
                if direct_module_import.alias is not None:
                    line += f" as {direct_module_import.alias}"
                writer.write_line(line)
            if len(import_to_write.named_imports) > 0:
                named_imports = ", ".join(map(stringify_named_import, import_to_write.named_imports))
                writer.write_line(f"from {stringified_module_name} import {named_imports}")

    def _register_import(self, reference_import: AST.ReferenceImport, imports: Imports) -> None:
        if reference_import.named_import is None:
            imports[reference_import.module].direct_module_imports.add(DirectModuleImport(alias=reference_import.alias))
        else:
            imports[reference_import.module].named_imports.add(
                NamedImport(name=reference_import.named_import, alias=reference_import.alias)
            )


def stringify_named_import(named_import: NamedImport) -> str:
    if named_import.alias is None:
        return named_import.name
    else:
        return f"{named_import.name} as {named_import.alias}"
