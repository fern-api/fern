from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Optional, Set

from .. import AST


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


def create_empty_module_imports() -> ModuleImports:
    return ModuleImports(direct_module_imports=set(), submodules=set())


class ImportsManager:
    _module_path_to_imports: DefaultDict[AST.ModulePath, ModuleImports] = defaultdict(create_empty_module_imports)

    def register_import(self, reference: AST.Reference) -> None:
        module_imports = self._module_path_to_imports[reference.module]
        if reference.submodule is None:
            module_imports.direct_module_imports.add(DirectModuleImport(alias=reference.alias))
        else:
            module_imports.submodules.add(SubmoduleImport(name=reference.submodule, alias=reference.alias))
