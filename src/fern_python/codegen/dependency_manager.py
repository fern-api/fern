from typing import Dict, Set

from . import AST


class DependencyManager:

    _dependencies: Dict[AST.DependencyName, AST.DependencyVersion] = {}

    def add_dependency(self, dependency: AST.Dependency) -> None:
        self._dependencies[dependency.name] = dependency.version

    def get_dependencies(self) -> Set[AST.Dependency]:
        return {AST.Dependency(name=name, version=version) for (name, version) in self._dependencies.items()}
