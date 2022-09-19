from __future__ import annotations

from typing import Optional, Union

from ..dependency import Dependency
from .module_path import ModulePath


class BuiltInModule:
    pass


class LocalModule:
    pass


class Module:
    def __init__(self, path: ModulePath, source: Union[Dependency, BuiltInModule, LocalModule]):
        self.path = path
        self._source = source

    def get_dependency(self) -> Optional[Dependency]:
        if isinstance(self._source, Dependency):
            return self._source
        return None

    def is_local(self) -> bool:
        return isinstance(self._source, LocalModule)

    @staticmethod
    def external(module_path: ModulePath, dependency: Dependency) -> Module:
        return Module(path=module_path, source=dependency)

    @staticmethod
    def built_in(*module_path: str) -> Module:
        return Module(path=module_path, source=BuiltInModule())

    @staticmethod
    def local(*module_path: str) -> Module:
        return Module(path=module_path, source=LocalModule())
