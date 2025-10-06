from typing import Dict, Set

from . import AST


class DependencyManager:
    def __init__(self) -> None:
        self._dependencies: Dict[AST.DependencyName, AST.Dependency] = {}
        self._dev_dependencies: Dict[AST.DependencyName, AST.Dependency] = {}

    def add_dependency(self, dependency: AST.Dependency) -> None:
        self._dependencies[dependency.name] = dependency

    def add_dev_dependency(self, dependency: AST.Dependency) -> None:
        self._dev_dependencies[dependency.name] = dependency

    def get_dependencies(self) -> Set[AST.Dependency]:
        return {dep for (_, dep) in self._dependencies.items()}

    def get_dev_dependencies(self) -> Set[AST.Dependency]:
        return {dep for (name, dep) in self._dev_dependencies.items()}
