from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set

from fern_python.codegen.ast.dependency.dependency import (
    Dependency,
    DependencyCompatibility,
)
from fern_python.codegen.dependency_manager import DependencyManager


@dataclass(frozen=True)
class PyProjectTomlPackageConfig:
    include: str
    _from: Optional[str] = None


class PyProjectToml:
    def __init__(
        self,
        *,
        name: str,
        version: Optional[str],
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
            f.write(content)

    class Block(ABC):
        @abstractmethod
        def to_string(self) -> str:
            pass

    @dataclass(frozen=True)
    class PoetryBlock(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig

        def to_string(self) -> str:
            s = f'''[tool.poetry]
name = "{self.name}"'''
            if self.version is not None:
                s += "\n" + f'version = "{self.version}"'
            s += """
description = ""
readme = "README.md"
authors = []"""
            if self.package._from is not None:
                s += f"""
packages = [
    {{ include = "{self.package.include}", from = "{self.package._from}"}}
]
"""
            else:
                s += f"""
packages = [
    {{ include = "{self.package.include}"}}
]
"""
            return s

    @dataclass(frozen=True)
    class DependenciesBlock(Block):
        dependencies: Set[Dependency]
        python_version: str

        def to_string(self) -> str:
            deps = ""
            for dep in sorted(self.dependencies, key=lambda dep: dep.name):
                compatiblity = dep.compatibility
                # TODO(dsinghvi): assert all enum cases are visited
                print(dep.compatibility)
                if compatiblity == DependencyCompatibility.EXACT:
                    print(f"{dep.name} is exact")
                    deps += f'{dep.name.replace(".", "-")} = "{dep.version}"\n'
                elif compatiblity == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    print(f"{dep.name} is greater than or equal")
                    deps += f'{dep.name.replace(".", "-")} = ">={dep.version}"\n'
            self.dependencies
            return f"""
[tool.poetry.dependencies]
python = "^{self.python_version}"
{deps}
[tool.poetry.dev-dependencies]
mypy = "^1.8.0"
pytest = "^7.4.0"
"""

    @dataclass(frozen=True)
    class BuildSystemBlock(Block):
        def to_string(self) -> str:
            return """
[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
