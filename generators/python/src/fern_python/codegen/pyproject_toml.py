from __future__ import annotations

import json
import os
import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, cast

from fern_python.codegen.ast.dependency.dependency import (
    Dependency,
    DependencyCompatibility,
)
from fern_python.codegen.dependency_manager import DependencyManager

from fern.generator_exec import (
    BasicLicense,
    GithubOutputMode,
    LicenseConfig,
    LicenseId,
    PypiMetadata,
)


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
        self._modern_block = PyProjectToml.ModernBlock(
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
            self._modern_block,
            PyProjectToml.LegacyBlock(
                name=self._name,
                version=self._modern_block.version,
                package=self._modern_block.package,
                pypi_metadata=self._modern_block.pypi_metadata,
                github_output_mode=self._modern_block.github_output_mode,
                license_=self._modern_block.license_,
                python_version=self._python_version,
                dependencies=self._dependency_manager.get_dependencies(),
                dev_dependencies=self._dependency_manager.get_dev_dependencies(),
            ),
            PyProjectToml.PluginConfigurationBlock(),
            PyProjectToml.BuildSystemBlock(),
        ]
        content = ""
        for block in blocks:
            content += block.to_string()

        # Handle optional dependencies (dev dependencies + extras)
        content += self._generate_optional_dependencies()

        if self._user_defined_toml is not None:
            content += "\n"
            content += self._user_defined_toml

        with open(os.path.join(self._path, "pyproject.toml"), "w") as f:
            f.write(content)

    def _generate_optional_dependencies(self) -> str:
        """Generate [project.optional-dependencies] section for extras only"""
        optional_deps = {}

        # Add extras only (dev dependencies are handled in Poetry section)
        for key, vals in self._extras.items():
            optional_deps[key] = vals

        if not optional_deps:
            return ""

        result = "\n[project.optional-dependencies]\n"
        for key, deps in optional_deps.items():
            deps_str = ", ".join([f'"{dep}"' for dep in deps])
            result += f"{key} = [{deps_str}]\n"

        return result

    class Block(ABC):
        @abstractmethod
        def to_string(self) -> str:
            pass

    @dataclass(frozen=True)
    class ModernBlock(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]

        def to_string(self) -> str:
            description = ""
            authors: List[Dict[str, str]] = []
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

            if self.pypi_metadata is not None:
                description = (
                    self.pypi_metadata.description if self.pypi_metadata.description is not None else description
                )
                if self.pypi_metadata.authors is not None:
                    for author in self.pypi_metadata.authors:
                        authors.append({"name": author.name, "email": author.email})
                keywords = self.pypi_metadata.keywords if self.pypi_metadata.keywords is not None else keywords
                if self.pypi_metadata.documentation_link is not None:
                    project_urls.append(f"Documentation = '{self.pypi_metadata.documentation_link}'")
                if self.pypi_metadata.homepage_link is not None:
                    project_urls.append(f"Homepage = '{self.pypi_metadata.homepage_link}'")

            if self.license_ is not None:
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        classifiers.append("License :: OSI Approved :: MIT License")
                    elif license_id == LicenseId.APACHE_2:
                        classifiers.append("License :: OSI Approved :: Apache Software License")

            if self.github_output_mode is not None:
                project_urls.append(f"Repository = '{self.github_output_mode.repo_url}'")

            stringified_project_urls = ""
            if len(project_urls) > 0:
                stringified_project_urls = "\n[project.urls]\n" + "\n".join(project_urls) + "\n"

            s = f"""[project]
name = "{self.name}" """
            if self.version is not None:
                s += f'\nversion = "{self.version}"'

            s += f"""
description = "{description}"
readme = "README.md"
requires-python = ">=3.8"
dependencies = []"""

            if self.package._from is not None:
                s += f"""
[tool.setuptools.packages.find]
where = ["{self.package._from}"]
include = ["{self.package.include}*"]
"""
            else:
                s += f"""
[tool.setuptools.packages.find]
include = ["{self.package.include}*"]
"""

            if authors:
                s += f"\nauthors = {json.dumps(authors)}"
            if keywords:
                s += f"\nkeywords = {json.dumps(keywords)}"
            if classifiers:
                s += f"\nclassifiers = {json.dumps(classifiers)}"

            s += stringified_project_urls
            return s

    @dataclass(frozen=True)
    class LegacyBlock(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]
        python_version: str
        dependencies: Set[Dependency]
        dev_dependencies: Set[Dependency]

        def to_string(self) -> str:
            description = ""
            if self.pypi_metadata is not None:
                description = self.pypi_metadata.description or ""

            authors = []
            if self.pypi_metadata is not None and self.pypi_metadata.authors is not None:
                for author in self.pypi_metadata.authors:
                    authors.append({"name": author.name, "email": author.email})

            keywords = []
            if self.pypi_metadata is not None and self.pypi_metadata.keywords is not None:
                keywords = self.pypi_metadata.keywords

            classifiers = []
            license_evaluated = ""
            if self.license_ is not None:
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        license_evaluated = 'license = "MIT"'
                        classifiers.append("License :: OSI Approved :: MIT License")
                    elif license_id == LicenseId.APACHE_2:
                        license_evaluated = 'license = "Apache-2.0"'
                        classifiers.append("License :: OSI Approved :: Apache Software License")

            # LegacyBlock doesn't generate project.urls - that's PEP 621 format

            s = f"""[tool.poetry]
name = "{self.name}" """
            if self.version is not None:
                s += f'\nversion = "{self.version}"'

            if self.package._from is not None:
                s += f"""
packages = [{{include = "{self.package.include}", from = "{self.package._from}"}}]"""
            else:
                s += f"""
packages = [{{include = "{self.package.include}"}}]"""

            s += f"""
description = "{description}"
readme = "README.md"
authors = {json.dumps(authors)}
keywords = {json.dumps(keywords)}
{license_evaluated}
classifiers = {json.dumps(classifiers)}"""

            # Add dependencies
            deps = self.deps_to_string(self.dependencies)
            dev_deps = self.deps_to_string(self.dev_dependencies)

            s += f"""
[tool.poetry.dependencies]
python = "{self.python_version}"
{deps}
[tool.poetry.group.dev.dependencies]
mypy = "==1.13.0"
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
httpx = "^0.24.0"
{dev_deps}"""
            return s

        def deps_to_string(self, dependencies: Set[Dependency]) -> str:
            deps = []
            for dep in sorted(dependencies, key=lambda dep: dep.name):
                name = dep.name.replace(".", "-")
                if dep.compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    deps.append(f'{name} = ">={dep.version}"')
                else:  # EXACT
                    # Check if version already contains a specifier
                    if dep.version.startswith(("==", ">=", "<=", "~=", "!=")):
                        deps.append(f'{name} = "{dep.version}"')
                    else:
                        deps.append(f'{name} = "=={dep.version}"')
            return "\n".join(deps)

    @dataclass(frozen=True)
    class DependenciesBlock(Block):
        dependencies: Set[Dependency]
        dev_dependencies: Set[Dependency]
        python_version: str

        def deps_to_string(self, dependencies: Set[Dependency]) -> str:
            deps = ""
            for dep in sorted(dependencies, key=lambda dep: dep.name):
                compatibility = dep.compatibility
                is_optional = dep.optional
                has_python_version = dep.python is not None
                version = dep.version
                extras = dep.extras
                name = dep.name.replace(".", "-")
                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"
                else:  # EXACT
                    # Check if version already contains a specifier
                    if dep.version.startswith(('==', '>=', '<=', '~=', '!=')):
                        version = dep.version
                    else:
                        version = f"=={dep.version}"

                if is_optional or has_python_version or dep.extras is not None:
                    deps += f'{name} = {{ version = "{version}"'
                    if is_optional:
                        deps += ", optional = true"
                    if has_python_version:
                        deps += f', python = "{dep.python}"'
                    if extras is not None:
                        deps += f", extras = {json.dumps(list(extras))}"
                    deps += "}\n"
                else:
                    deps += f'{name} = "{version}"\n'
            return deps

        def to_string(self) -> str:
            deps = self.deps_to_string(self.dependencies)
            dev_deps = self.deps_to_string(self.dev_dependencies)
            return f"""
[tool.poetry.dependencies]
python = "{self.python_version}"
{deps}
[tool.poetry.group.dev.dependencies]
mypy = "==1.13.0"
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

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "F",  # pyflakes
    "I",  # isort
]
ignore = [
    "E402",  # Module level import not at top of file
    "E501",  # Line too long
    "E711",  # Comparison to `None` should be `cond is not None`
    "E712",  # Avoid equality comparisons to `True`; use `if ...:` checks
    "E721",  # Use `is` and `is not` for type comparisons, or `isinstance()` for insinstance checks
    "E722",  # Do not use bare `except`
    "E731",  # Do not assign a `lambda` expression, use a `def`
    "F821",  # Undefined name
    "F841"   # Local variable ... is assigned to but never used
]

[tool.ruff.lint.isort]
section-order = ["future", "standard-library", "third-party", "first-party"]
"""

    @dataclass(frozen=True)
    class BuildSystemBlock(Block):
        def to_string(self) -> str:
            return """
[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
