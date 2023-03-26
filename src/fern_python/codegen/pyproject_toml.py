from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from inspect import cleandoc
from typing import List, Set

from fern_python.codegen.ast.dependency.dependency import Dependency
from fern_python.codegen.dependency_manager import DependencyManager


@dataclass(frozen=True)
class PyProjectTomlPackageConfig:
    include: str
    _from: str


class PyProjectToml:
    def __init__(
        self,
        *,
        name: str,
        version: str,
        package: PyProjectTomlPackageConfig,
        path: str,
        dependency_manager: DependencyManager,
        python_version: str,
    ):
        self._poetry_block = PyProjectToml.PoetryBlock(name=name, version=version, package=package)
        self._dependency_manager = dependency_manager
        self._path = path
        self._python_version = python_version

    def write(self) -> None:
        blocks: List[PyProjectToml.Block] = [
            self._poetry_block,
            PyProjectToml.DependenciesBlock(
                dependencies=self._dependency_manager.get_dependencies(),
                python_version=self._python_version,
            ),
            PyProjectToml.BuildSystemBlock(),
        ]
        content = ""
        for block in blocks:
            content += block.to_string()
        with open(os.path.join(self._path, "pyproject.toml"), "w") as f:
            f.write(cleandoc(content))

    class Block(ABC):
        @abstractmethod
        def to_string(self) -> str:
            pass

    @dataclass(frozen=True)
    class PoetryBlock(Block):
        name: str
        version: str
        package: PyProjectTomlPackageConfig

        def to_string(self) -> str:
            return f"""
            [tool.poetry]
            name = "{self.name}"
            version = "{self.version}"
            description = ""
            authors = []
            packages = [
                {{ include = "{self.package.include}", from = "{self.package._from}"}}
            ]
            """

    @dataclass(frozen=True)
    class DependenciesBlock(Block):
        dependencies: Set[Dependency]
        python_version: str

        def to_string(self) -> str:
            deps = ""
            for dep in self.dependencies:
                deps += f'{dep.name.replace(".", "-")} = "{dep.version}"\n'
            self.dependencies
            return f"""
            [tool.poetry.dependencies]
            python = "^{self.python_version}"
            {deps}
            """

    @dataclass(frozen=True)
    class BuildSystemBlock(Block):
        def to_string(self) -> str:
            return """
            [build-system]
            requires = ["poetry-core"]
            build-backend = "poetry.core.masonry.api"
            """
