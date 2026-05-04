from typing import Dict, Set

from . import AST


class DependencyManager:
    def __init__(self) -> None:
        self._dependencies: Dict[AST.DependencyName, AST.Dependency] = {}
        self._dev_dependencies: Dict[AST.DependencyName, AST.Dependency] = {}
        self._user_override_dependencies: Set[AST.DependencyName] = set()
        self._user_override_dev_dependencies: Set[AST.DependencyName] = set()

    def add_dependency(self, dependency: AST.Dependency, *, is_user_override: bool = False) -> None:
        if is_user_override:
            self._user_override_dependencies.add(dependency.name)
            self._dependencies[dependency.name] = dependency
        elif dependency.name not in self._user_override_dependencies:
            self._dependencies[dependency.name] = dependency

    def add_dev_dependency(self, dependency: AST.Dependency, *, is_user_override: bool = False) -> None:
        if is_user_override:
            self._user_override_dev_dependencies.add(dependency.name)
            self._dev_dependencies[dependency.name] = dependency
        elif dependency.name not in self._user_override_dev_dependencies:
            self._dev_dependencies[dependency.name] = dependency

    def get_dependencies(self) -> Set[AST.Dependency]:
        return {dep for (name, dep) in self._dependencies.items()}

    def get_dev_dependencies(self) -> Set[AST.Dependency]:
        return {dep for (name, dep) in self._dev_dependencies.items()}
