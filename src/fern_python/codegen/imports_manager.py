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
    def __init__(self, project_name: str):
        self._project_name = project_name
        self._top_imports: Imports = defaultdict(create_empty_module_imports)
        self._bottom_imports: Imports = defaultdict(create_empty_module_imports)

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
            stringified_module_name = ".".join(module_name)
            for direct_module_import in import_to_write.direct_module_imports:
                line = f"import {stringified_module_name}"
                if direct_module_import.alias is not None:
                    line += f" as {direct_module_import.alias}"
                writer.write_line(line)
            if len(import_to_write.named_imports) > 0:
                named_imports = ", ".join(map(stringify_named_import, import_to_write.named_imports))
                writer.write_line(f"from {stringified_module_name} import {named_imports}")

    def _register_import(self, reference: AST.Reference, imports: Imports) -> None:
        module_path = (
            reference.module if reference.from_module is not None else (self._project_name,) + reference.module
        )
        if reference.named_import is None:
            imports[module_path].direct_module_imports.add(DirectModuleImport(alias=reference.alias))
        else:
            imports[module_path].named_imports.add(NamedImport(name=reference.named_import, alias=reference.alias))


def stringify_named_import(named_import: NamedImport) -> str:
    if named_import.alias is None:
        return named_import.name
    else:
        return f"{named_import.name} as {named_import.alias}"
