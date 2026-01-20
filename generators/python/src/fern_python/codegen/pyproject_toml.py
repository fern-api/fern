from __future__ import annotations

import json
import os
import re
import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set, Tuple, cast

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

# All known Python 3.x minor versions for classifier generation
ALL_PYTHON_VERSIONS = ["3.8", "3.9", "3.10", "3.11", "3.12", "3.13"]


def parse_python_version_constraint(version_constraint: str) -> Tuple[str, List[str]]:
    """
    Parse a Python version constraint and return the minimum version and list of supported versions.

    Supports formats like:
    - ">=3.9,<3.14" - Range with min and max
    - "^3.8" - Caret constraint (compatible with 3.8.x, 3.9.x, etc.)
    - "~3.9" - Tilde constraint (compatible with 3.9.x)
    - ">=3.9" - Minimum only
    - "3.9" - Exact version

    Returns:
        Tuple of (minimum_version, list_of_supported_versions)
    """
    min_version: Optional[str] = None
    max_version: Optional[str] = None

    # Handle caret constraint (^3.8 means >=3.8.0 <4.0.0)
    caret_match = re.match(r"^\^(\d+)\.(\d+)", version_constraint)
    if caret_match:
        major = int(caret_match.group(1))
        minor = int(caret_match.group(2))
        min_version = f"{major}.{minor}"
        # Caret allows all minor versions up to next major
        max_version = f"{major + 1}.0"

    # Handle tilde constraint (~3.9 means >=3.9.0 <3.10.0)
    tilde_match = re.match(r"^~(\d+)\.(\d+)", version_constraint)
    if tilde_match:
        major = int(tilde_match.group(1))
        minor = int(tilde_match.group(2))
        min_version = f"{major}.{minor}"
        max_version = f"{major}.{minor + 1}"

    # Handle range constraints (>=3.9,<3.14 or >=3.9, <3.14)
    if min_version is None:
        # Look for >= or > constraint
        ge_match = re.search(r">=?\s*(\d+)\.(\d+)", version_constraint)
        if ge_match:
            min_version = f"{ge_match.group(1)}.{ge_match.group(2)}"

        # Look for < or <= constraint
        lt_match = re.search(r"<\s*(\d+)\.(\d+)", version_constraint)
        if lt_match:
            max_version = f"{lt_match.group(1)}.{lt_match.group(2)}"

        le_match = re.search(r"<=\s*(\d+)\.(\d+)", version_constraint)
        if le_match:
            major = int(le_match.group(1))
            minor = int(le_match.group(2))
            # <= 3.12 means we include 3.12, so max is 3.13
            max_version = f"{major}.{minor + 1}"

    # Handle exact version (just "3.9" or "3.9.0")
    if min_version is None:
        exact_match = re.match(r"^(\d+)\.(\d+)", version_constraint)
        if exact_match:
            min_version = f"{exact_match.group(1)}.{exact_match.group(2)}"

    # Default to 3.8 if we couldn't parse
    if min_version is None:
        min_version = "3.8"

    # Filter ALL_PYTHON_VERSIONS based on min and max
    supported_versions: List[str] = []
    for version in ALL_PYTHON_VERSIONS:
        parts = version.split(".")
        major, minor = int(parts[0]), int(parts[1])

        # Check minimum
        if min_version:
            min_parts = min_version.split(".")
            min_major, min_minor = int(min_parts[0]), int(min_parts[1])
            if (major, minor) < (min_major, min_minor):
                continue

        # Check maximum (exclusive)
        if max_version:
            max_parts = max_version.split(".")
            max_major, max_minor = int(max_parts[0]), int(max_parts[1])
            if (major, minor) >= (max_major, max_minor):
                continue

        supported_versions.append(version)

    # If no versions matched, default to the minimum version
    if not supported_versions:
        supported_versions = [min_version]

    return min_version, supported_versions


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
        enable_wire_tests: bool = False,
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
            python_version=python_version,
        )
        self._dependency_manager = dependency_manager
        self._path = path
        self._python_version = python_version
        self._extras = extras
        self._enable_wire_tests = enable_wire_tests
        self._user_defined_toml = user_defined_toml

    def write(self) -> None:
        blocks: List[PyProjectToml.Block] = [
            self._poetry_block,
            PyProjectToml.DependenciesBlock(
                dependencies=self._dependency_manager.get_dependencies(),
                dev_dependencies=self._dependency_manager.get_dev_dependencies(),
                python_version=self._python_version,
                enable_wire_tests=self._enable_wire_tests,
            ),
            PyProjectToml.PluginConfigurationBlock(),
            PyProjectToml.BuildSystemBlock(),
        ]
        content = f"""[project]
name = "{self._name}"
dynamic = ["version"]

"""

        for block in blocks:
            content += block.to_string()

        if len(self._extras) > 0:
            content += """
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
        python_version: str = "^3.8"

        def to_string(self) -> str:
            s = f'''[tool.poetry]
name = "{self.name}"'''
            if self.version is not None:
                s += "\n" + f'version = "{self.version}"'

            description = ""
            authors: List[str] = []
            keywords: List[str] = []
            project_urls: List[str] = []

            # Generate classifiers based on the python_version constraint
            _, supported_versions = parse_python_version_constraint(self.python_version)
            classifiers = [
                "Intended Audience :: Developers",
                "Programming Language :: Python",
                "Programming Language :: Python :: 3",
            ]
            for version in supported_versions:
                classifiers.append(f"Programming Language :: Python :: {version}")
            classifiers.extend(
                [
                    "Operating System :: OS Independent",
                    "Operating System :: POSIX",
                    "Operating System :: MacOS",
                    "Operating System :: POSIX :: Linux",
                    "Operating System :: Microsoft :: Windows",
                    "Topic :: Software Development :: Libraries :: Python Modules",
                    "Typing :: Typed",
                ]
            )
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
                stringified_project_urls = "\n[tool.poetry.urls]\n" + "\n".join(project_urls) + "\n"

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
        enable_wire_tests: bool = False

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

            # Conditionally add requests and types-requests for wire tests
            wire_test_deps = ""
            if self.enable_wire_tests:
                wire_test_deps = 'requests = "^2.31.0"\ntypes-requests = "^2.31.0"\n'

            return f"""
[tool.poetry.dependencies]
python = "{self.python_version}"
{deps}
[tool.poetry.group.dev.dependencies]
mypy = "==1.13.0"
pytest = "^7.4.0"
pytest-asyncio = "^0.23.5"
pytest-xdist = "^3.6.1"
python-dateutil = "^2.9.0"
types-python-dateutil = "^2.9.0.20240316"
{wire_test_deps}{dev_deps}"""

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
