from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Union

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
    source: Optional[Union[Dependency, BuiltInModule, LocalModule]] = None
    types_package: Optional[Dependency] = None

    def get_dependencies(self) -> List[Dependency]:
        dependencies: List[Dependency] = []
        if isinstance(self.source, Dependency):
            dependencies.append(self.source)
        if self.types_package is not None:
            dependencies.append(self.types_package)
        return dependencies

    def is_local(self) -> bool:
        return isinstance(self.source, LocalModule)

    @staticmethod
    def external(
        module_path: ModulePath, *, dependency: Dependency, types_package: Optional[Dependency] = None
    ) -> Module:
        return Module(path=module_path, source=dependency, types_package=types_package)

    @staticmethod
    def snippet(
        module_path: ModulePath,
    ) -> Module:
        return Module(path=module_path)

    @staticmethod
    def built_in(module_path: ModulePath, *, types_package: Optional[Dependency] = None) -> Module:
        return Module(path=module_path, source=BuiltInModule(), types_package=types_package)

    @staticmethod
    def local(*module_path: str) -> Module:
        return Module(path=module_path, source=LocalModule())
