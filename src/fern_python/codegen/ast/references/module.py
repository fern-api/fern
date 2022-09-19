from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Union

from ..dependency import Dependency
from .module_path import ModulePath


@dataclass(frozen=True)
class BuiltInModule:
    pass


@dataclass(frozen=True)
class LocalModule:
    pass


@dataclass(frozen=True)
class Module:
    path: ModulePath
    source: Union[Dependency, BuiltInModule, LocalModule]

    def get_dependency(self) -> Optional[Dependency]:
        if isinstance(self.source, Dependency):
            return self.source
        return None

    def is_local(self) -> bool:
        return isinstance(self.source, LocalModule)

    @staticmethod
    def external(module_path: ModulePath, dependency: Dependency) -> Module:
        return Module(path=module_path, source=dependency)

    @staticmethod
    def built_in(*module_path: str) -> Module:
        return Module(path=module_path, source=BuiltInModule())

    @staticmethod
    def local(*module_path: str) -> Module:
        return Module(path=module_path, source=LocalModule())
