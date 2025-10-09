from __future__ import annotations

import json
import os
import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set, cast

from fern_python.codegen.ast.dependency.dependency import Dependency
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
        self._project_block = PyProjectToml.ProjectBlock(
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
        self._package = package
        self._extras = extras
        self._user_defined_toml = user_defined_toml

    def write(self) -> None:
        # Generate the main [project] block with dependencies and optional dependencies
        content = self._project_block.to_string(
            dependencies=self._dependency_manager.get_dependencies(),
            dev_dependencies=self._dependency_manager.get_dev_dependencies(),
            extras=self._extras,
        )

        # Add other blocks
        blocks: List[PyProjectToml.Block] = [
            PyProjectToml.PluginConfigurationBlock(),
            PyProjectToml.BuildSystemBlock(package=self._package),
            PyProjectToml.PoetryBlock(package=self._package),
        ]

        for block in blocks:
            content += block.to_string()

        if self._user_defined_toml is not None:
            content += "\n"
            content += self._user_defined_toml

        with open(os.path.join(self._path, "pyproject.toml"), "w") as f:
            f.write(content)

    class Block(ABC):
        @abstractmethod
        def to_string(self) -> str:
            pass

    @staticmethod
    def _parse_caret_constraint(version_constraint: str) -> str:
        """
        Converts a caret (^) version constraint to a PEP 440 compatible range.

        Examples:
            ^3.9 -> >=3.9,<4.0
            ^1.2.3 -> >=1.2.3,<2.0.0
            ^0.2.3 -> >=0.2.3,<0.3.0
        """
        if not version_constraint.startswith("^"):
            return version_constraint

        base_version = version_constraint[1:]
        parts = base_version.split(".")

        if len(parts) == 0:
            return base_version

        # For 0.x versions, bump the minor version
        if parts[0] == "0" and len(parts) > 1:
            upper_parts = parts.copy()
            upper_parts[1] = str(int(parts[1]) + 1)
            if len(upper_parts) > 2:
                upper_parts[2] = "0"
            upper_version = ".".join(upper_parts)
        else:
            # For x.y versions (x >= 1), bump the major version
            upper_parts = [str(int(parts[0]) + 1), "0"]
            if len(parts) > 2:
                upper_parts.append("0")
            upper_version = ".".join(upper_parts)

        return f">={base_version},<{upper_version}"

    @dataclass(frozen=True)
    class ProjectBlock(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]
        python_version: str

        def to_string(
            self,
            dependencies: Set[Dependency] = set(),
            dev_dependencies: Set[Dependency] = set(),
            extras: typing.Dict[str, List[str]] = {},
        ) -> str:
            s = f'[project]\nname = "{self.name}"\n'
            if self.version is not None:
                s += f'version = "{self.version}"\n'

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
                # TODO(armandobelardo): verify poetry handles custom licenses on its side
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

            s += f'description = "{description}"\n'
            s += 'readme = "README.md"\n'
            s += f"authors = {json.dumps(authors, indent=4)}\n"
            s += f"keywords = {json.dumps(keywords, indent=4)}\n"

            # Handle requires-python with caret constraint support
            python_constraint = PyProjectToml._parse_caret_constraint(self.python_version)
            s += f'requires-python = "{python_constraint}"\n'
            if license_evaluated:
                s += f"{license_evaluated}\n"
            s += f"classifiers = {json.dumps(classifiers, indent=4)}\n"

            # Add dependencies
            main_deps = self._deps_to_pep621_string(dependencies)
            s += "dependencies = [\n"
            for dep in main_deps:
                s += f"    {dep},\n"
            s += "]\n"

            # Add dev dependencies under [dependency-groups]
            dev_deps = self._deps_to_pep621_string(dev_dependencies)
            standard_dev = [
                '"mypy==1.13.0"',
                '"pytest>=7.4.0,<8.0.0"',
                '"pytest-asyncio>=0.23.5,<0.24.0"',
                '"python-dateutil>=2.9.0,<3.0.0"',
                '"types-python-dateutil>=2.9.0.20240316"',
            ]
            all_dev_deps = standard_dev + dev_deps

            # Add dependency groups (dev)
            if len(all_dev_deps) > 0:
                s += "\n[dependency-groups]\n"
                s += "dev = [\n"
                for val in all_dev_deps:
                    s += f"    {val},\n"
                s += "]\n"

            # Add optional dependencies (extras only, not dev)
            if len(extras) > 0:
                s += "\n[project.optional-dependencies]\n"
                for key, vals in extras.items():
                    s += f"{key} = [\n"
                    for val in vals:
                        # Add quotes if not already present
                        if not val.startswith('"'):
                            val = f'"{val}"'
                        s += f"    {val},\n"
                    s += "]\n"

            if len(project_urls) > 0:
                s += "\n[project.urls]\n" + "\n".join(project_urls) + "\n"

            return s

        def _deps_to_pep621_string(self, dependencies: Set[Dependency]) -> List[str]:
            deps = []
            for dep in sorted(dependencies, key=lambda dep: dep.name):
                # Skip optional dependencies - they should be in separate optional-dependencies groups
                if dep.optional:
                    continue

                name = dep.name.replace(".", "-")

                # Handle version - if no operator provided, default to ==
                version = PyProjectToml._parse_caret_constraint(dep.version)
                if version and version[0].isdigit():
                    version = f"=={version}"

                # Handle extras - convert to PEP 508 syntax
                extras_str = ""
                if dep.extras is not None and len(dep.extras) > 0:
                    extras_str = f"[{','.join(sorted(dep.extras))}]"

                # Handle python version constraints - convert to PEP 508 environment markers
                marker_str = ""
                if dep.python is not None:
                    python_constraint = PyProjectToml._parse_caret_constraint(dep.python)
                    # The constraint is now in PEP 440 format (e.g., ">=3.9,<4.0")
                    # We need to convert this to PEP 508 environment marker syntax
                    if "," in python_constraint:
                        # Split range constraints like ">=3.9,<4.0"
                        parts = python_constraint.split(",")
                        marker_parts = []
                        for part in parts:
                            part = part.strip()
                            for op in [">=", "<=", ">", "<", "==", "!="]:
                                if part.startswith(op):
                                    py_version = part[len(op) :]
                                    marker_parts.append(f"python_version {op} '{py_version}'")
                                    break
                        marker_str = f"; {' and '.join(marker_parts)}"
                    else:
                        # Simple constraint like ">=3.9"
                        for op in [">=", "<=", ">", "<", "==", "!="]:
                            if python_constraint.startswith(op):
                                py_version = python_constraint[len(op) :]
                                marker_str = f"; python_version {op} '{py_version}'"
                                break

                dep_str = f'"{name}{extras_str}{version}{marker_str}"'
                deps.append(dep_str)
            return deps

    @dataclass(frozen=True)
    class PluginConfigurationBlock(Block):
        def to_string(self) -> str:
            return """
[tool.pytest.ini_options]
testpaths = [ "tests" ]
asyncio_mode = "auto"

[tool.mypy]
plugins = ["pydantic.mypy"]

[[tool.mypy.overrides]]
module = "pydantic.v1.*"
ignore_missing_imports = true

[[tool.mypy.overrides]]
module = "pydantic.*"
follow_imports = "skip"

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
        package: PyProjectTomlPackageConfig

        def to_string(self) -> str:
            s = """
[build-system]
requires = ["uv-build>=0.8.23,<0.9.0"]
build-backend = "uv_build"

[tool.uv.build-backend]
"""
            module_name = self.package.include.replace("/", ".")
            s += f'module-name = "{module_name}"\n'
            if self.package._from is not None:
                s += f'module-root = "{self.package._from}"\n'
            return s

    @dataclass(frozen=True)
    class PoetryBlock(Block):
        package: PyProjectTomlPackageConfig

        def to_string(self) -> str:
            s = "\n[tool.poetry]\n"
            if self.package._from is not None:
                s += f'packages = [\n    {{ include = "{self.package.include}", from = "{self.package._from}"}}\n]\n'
            else:
                s += f'packages = [\n    {{ include = "{self.package.include}"}}\n]\n'
            return s
