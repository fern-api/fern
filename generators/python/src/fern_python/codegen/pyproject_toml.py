from __future__ import annotations

import json
import os
import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set, cast

from fern.generator_exec import (
    BasicLicense,
    GithubOutputMode,
    LicenseConfig,
    LicenseId,
    PypiMetadata,
)

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
        pypi_metadata: Optional[PypiMetadata],
        github_output_mode: Optional[GithubOutputMode],
        license_: Optional[LicenseConfig],
        extras: typing.Dict[str, List[str]] = {},
        user_defined_toml: Optional[str] = None,
    ):
        self._name = name
        self._poetry_block = PyProjectToml.PoetryBlock(
            name=name,
            version=version,
            package=package,
            pypi_metadata=pypi_metadata,
            github_output_mode=github_output_mode,
            license_=license_,
        )
        self._dependency_manager = dependency_manager
        self._path = path
        self._python_version = python_version
        self._extras = extras
        self._user_defined_toml = user_defined_toml

    def write(self) -> None:
        blocks: List[PyProjectToml.Block] = [
            self._poetry_block,
            PyProjectToml.DependenciesBlock(
                dependencies=self._dependency_manager.get_dependencies(),
                dev_dependencies=self._dependency_manager.get_dev_dependencies(),
                python_version=self._python_version,
            ),
            PyProjectToml.PluginConfigurationBlock(),
            PyProjectToml.BuildSystemBlock(),
        ]
        content = f"""[project]
name = "{self._name}"

"""

        for block in blocks:
            content += block.to_string()

        if len(self._extras) > 0:
            content += f"""
[tool.poetry.extras]
"""
            for key, vals in self._extras.items():
                stringified_vals = ", ".join([f'"{val}"' for val in vals])
                content += f"{key}=[{stringified_vals}]\n"

        if self._user_defined_toml is not None:
            content += "\n"
            content += self._user_defined_toml

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
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]

        def to_string(self) -> str:
            s = f'''[tool.poetry]
name = "{self.name}"'''
            if self.version is not None:
                s += "\n" + f'version = "{self.version}"'

            description = ""
            authors: List[str] = []
            keywords: List[str] = []
            project_urls: List[str] = []
            classifiers = [
                "Intended Audience :: Developers",
                "Programming Language :: Python",
                "Programming Language :: Python :: 3",
                "Programming Language :: Python :: 3.8",
                "Programming Language :: Python :: 3.9",
                "Programming Language :: Python :: 3.10",
                "Programming Language :: Python :: 3.11",
                "Programming Language :: Python :: 3.12",
                "Operating System :: OS Independent",
                "Operating System :: POSIX",
                "Operating System :: MacOS",
                "Operating System :: POSIX :: Linux",
                "Operating System :: Microsoft :: Windows",
                "Topic :: Software Development :: Libraries :: Python Modules",
                "Typing :: Typed",
            ]
            license_evaluated = ""
            if self.pypi_metadata is not None:
                description = (
                    self.pypi_metadata.description if self.pypi_metadata.description is not None else description
                )
                authors = (
                    [f"{author.name} <{author.email}>" for author in self.pypi_metadata.authors]
                    if self.pypi_metadata.authors is not None
                    else authors
                )
                keywords = self.pypi_metadata.keywords if self.pypi_metadata.keywords is not None else keywords
                if self.pypi_metadata.documentation_link is not None:
                    project_urls.append(f"Documentation = '{self.pypi_metadata.documentation_link}'")
                if self.pypi_metadata.homepage_link is not None:
                    project_urls.append(f"Homepage = '{self.pypi_metadata.homepage_link}'")

            if self.license_ is not None:
                # TODO(armandobelardo): verify poetry handles custom licenses on it's side
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        license_evaluated = 'license = "MIT"'
                        classifiers.append("License :: OSI Approved :: MIT License")
                    elif license_id == LicenseId.APACHE_2:
                        license_evaluated = 'license = "Apache-2.0"'
                        classifiers.append("License :: OSI Approved :: Apache Software License")

            if self.github_output_mode is not None:
                project_urls.append(f"Repository = '{self.github_output_mode.repo_url}'")

            stringified_project_urls = ""
            if len(project_urls) > 0:
                stringified_project_urls = "\n[project.urls]\n" + "\n".join(project_urls) + "\n"

            s += f"""
description = "{description}"
readme = "README.md"
authors = {json.dumps(authors, indent=4)}
keywords = {json.dumps(keywords, indent=4)}
{license_evaluated}
classifiers = {json.dumps(classifiers, indent=4)}"""
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
            s += stringified_project_urls
            return s

    @dataclass(frozen=True)
    class DependenciesBlock(Block):
        dependencies: Set[Dependency]
        dev_dependencies: Set[Dependency]
        python_version: str

        def deps_to_string(self, dependencies: Set[Dependency]) -> str:
            deps = ""
            for dep in sorted(dependencies, key=lambda dep: dep.name):
                compatiblity = dep.compatibility
                is_optional = dep.optional
                version = dep.version
                extras = dep.extras
                name = dep.name.replace(".", "-")
                if compatiblity == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"

                if is_optional or dep.extras is not None:
                    deps += f'{name} = {{ version = "{version}"'
                    if is_optional:
                        deps += ", optional = true"
                    if extras is not None:
                        deps += f", extras = {json.dumps(list(extras))}"
                    deps += "}\n"
                else:
                    deps += f'{name} = "{version}"\n'
            return deps

        def to_string(self) -> str:
            deps = self.deps_to_string(self.dependencies)
            dev_deps = self.deps_to_string(self.dev_dependencies)
            # Note mypy and pydantic don't play well together, we either needed
            # to use an old mypy version (1.0.1) or bump the pydantic version (1.10.7)
            # I couldn't confirm bumping the pydantic version worked, so we lower mypy for now
            # https://github.com/pydantic/pydantic/issues/5070
            return f"""
[tool.poetry.dependencies]
python = "{self.python_version}"
{deps}
[tool.poetry.dev-dependencies]
mypy = "1.0.1"
pytest = "^7.4.0"
pytest-asyncio = "^0.23.5"
python-dateutil = "^2.9.0"
types-python-dateutil = "^2.9.0.20240316"
{dev_deps}"""

    @dataclass(frozen=True)
    class PluginConfigurationBlock(Block):
        def to_string(self) -> str:
            return """
[tool.pytest.ini_options]
testpaths = [ "tests" ]
asyncio_mode = "auto"

[tool.mypy]
plugins = ["pydantic.mypy"]

[tool.ruff]
line-length = 120

"""

    @dataclass(frozen=True)
    class BuildSystemBlock(Block):
        def to_string(self) -> str:
            return """
[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
