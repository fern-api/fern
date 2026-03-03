from __future__ import annotations

import json
import os
import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set, cast

from fern_python.codegen.ast.dependency.dependency import (
    Dependency,
    DependencyCompatibility,
)
from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.pypi_classifier_creator import PyPIClassifierMetadataGenerator

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
        enable_wire_tests: bool = False,
        user_defined_toml: Optional[str] = None,
        mypy_exclude: Optional[List[str]] = None,
        package_manager: str = "poetry",
    ):
        self._name = name
        self._version = version
        self._package = package
        self._package_manager = package_manager
        self._poetry_block = PyProjectToml.PoetryBlock(
            name=name,
            version=version,
            package=package,
            classifiers=PyPIClassifierMetadataGenerator.create_classifiers(
                python_version=python_version,
                license_=license_,
            ),
            pypi_metadata=pypi_metadata,
            github_output_mode=github_output_mode,
            license_=license_,
        )
        self._pypi_metadata = pypi_metadata
        self._github_output_mode = github_output_mode
        self._license = license_
        self._dependency_manager = dependency_manager
        self._path = path
        self._python_version = python_version
        self._extras = extras
        self._enable_wire_tests = enable_wire_tests
        self._user_defined_toml = user_defined_toml
        self._mypy_exclude = mypy_exclude

    def write(self) -> None:
        if self._package_manager == "uv":
            self._write_uv()
        else:
            self._write_poetry()

    def _write_poetry(self) -> None:
        blocks: List[PyProjectToml.Block] = [
            self._poetry_block,
            PyProjectToml.DependenciesBlock(
                dependencies=self._dependency_manager.get_dependencies(),
                dev_dependencies=self._dependency_manager.get_dev_dependencies(),
                python_version=self._python_version,
                enable_wire_tests=self._enable_wire_tests,
            ),
            PyProjectToml.PluginConfigurationBlock(mypy_exclude=self._mypy_exclude),
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
                stringified_vals = ", ".join([f'"{ val}"' for val in vals])
                content += f"{key}=[{stringified_vals}]\n"

        if self._user_defined_toml is not None:
            content += "\n"
            content += self._user_defined_toml

        with open(os.path.join(self._path, "pyproject.toml"), "w") as f:
            f.write(content)

    def _write_uv(self) -> None:
        blocks: List[PyProjectToml.Block] = [
            PyProjectToml.ProjectBlock(
                name=self._name,
                version=self._version,
                package=self._package,
                classifiers=PyPIClassifierMetadataGenerator.create_classifiers(
                    python_version=self._python_version,
                    license_=self._license,
                ),
                python_version=self._python_version,
                dependencies=self._dependency_manager.get_dependencies(),
                pypi_metadata=self._pypi_metadata,
                github_output_mode=self._github_output_mode,
                license_=self._license,
            ),
            PyProjectToml.UvDependencyGroupsBlock(
                dev_dependencies=self._dependency_manager.get_dev_dependencies(),
                enable_wire_tests=self._enable_wire_tests,
            ),
            PyProjectToml.PluginConfigurationBlock(mypy_exclude=self._mypy_exclude),
            PyProjectToml.HatchBuildSystemBlock(
                package=self._package,
            ),
        ]
        content = ""
        for block in blocks:
            content += block.to_string()

        if len(self._extras) > 0:
            content += "\n[project.optional-dependencies]\n"
            for key, vals in self._extras.items():
                stringified_vals = ", ".join([f'"{ val}"' for val in vals])
                content += f"{key} = [{stringified_vals}]\n"

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
        classifiers: List[str]
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
                    elif license_id == LicenseId.APACHE_2:
                        license_evaluated = 'license = "Apache-2.0"'

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
classifiers = {json.dumps(self.classifiers, indent=4)}"""
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
        mypy_exclude: Optional[List[str]] = None

        def to_string(self) -> str:
            mypy_exclude_config = ""
            if self.mypy_exclude:
                exclude_patterns = ", ".join([f'"{pattern}"' for pattern in self.mypy_exclude])
                mypy_exclude_config = f"\nexclude = [{exclude_patterns}]"

            return f"""
[tool.pytest.ini_options]
testpaths = [ "tests" ]
asyncio_mode = "auto"

[tool.mypy]
plugins = ["pydantic.mypy"]{mypy_exclude_config}

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

    @dataclass(frozen=True)
    class ProjectBlock(Block):
        """PEP 621 [project] block for uv-compatible pyproject.toml."""
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        classifiers: List[str]
        python_version: str
        dependencies: Set[Dependency]
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]

        def _convert_poetry_version_to_pep440(self, version: str) -> str:
            """Convert Poetry version specifiers to PEP 440 format."""
            version = version.strip()
            if version.startswith("^"):
                # ^X.Y.Z means >=X.Y.Z, <(X+1).0.0
                base = version[1:]
                parts = base.split(".")
                major = int(parts[0])
                if major == 0 and len(parts) > 1:
                    minor = int(parts[1])
                    return f">={base},<{major}.{minor + 1}.0"
                return f">={base},<{major + 1}.0.0"
            if version.startswith("~"):
                # ~X.Y.Z means >=X.Y.Z, <X.(Y+1).0
                base = version[1:]
                parts = base.split(".")
                major = int(parts[0])
                minor = int(parts[1]) if len(parts) > 1 else 0
                return f">={base},<{major}.{minor + 1}.0"
            return version

        def _python_version_to_requires_python(self, version: str) -> str:
            """Convert Poetry python version to PEP 440 requires-python."""
            return self._convert_poetry_version_to_pep440(version)

        def to_string(self) -> str:
            s = f'[project]\nname = "{self.name}"\n'
            if self.version is not None:
                s += f'version = "{self.version}"\n'

            description = ""
            authors: List[typing.Dict[str, str]] = []
            keywords: List[str] = []
            project_urls: List[str] = []

            license_str = ""
            if self.pypi_metadata is not None:
                description = (
                    self.pypi_metadata.description if self.pypi_metadata.description is not None else description
                )
                if self.pypi_metadata.authors is not None:
                    authors = [
                        {"name": author.name, "email": author.email}
                        for author in self.pypi_metadata.authors
                    ]
                keywords = self.pypi_metadata.keywords if self.pypi_metadata.keywords is not None else keywords
                if self.pypi_metadata.documentation_link is not None:
                    project_urls.append(f'Documentation = "{self.pypi_metadata.documentation_link}"')
                if self.pypi_metadata.homepage_link is not None:
                    project_urls.append(f'Homepage = "{self.pypi_metadata.homepage_link}"')

            if self.license_ is not None:
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        license_str = 'license = "MIT"\n'
                    elif license_id == LicenseId.APACHE_2:
                        license_str = 'license = "Apache-2.0"\n'

            if self.github_output_mode is not None:
                project_urls.append(f'Repository = "{self.github_output_mode.repo_url}"')

            s += f'description = "{description}"\n'
            s += 'readme = "README.md"\n'

            if authors:
                authors_str = json.dumps(authors, indent=4)
                s += f'authors = {authors_str}\n'
            else:
                s += 'authors = []\n'

            if keywords:
                s += f'keywords = {json.dumps(keywords, indent=4)}\n'

            s += license_str
            s += f'classifiers = {json.dumps(self.classifiers, indent=4)}\n'

            requires_python = self._python_version_to_requires_python(self.python_version)
            s += f'requires-python = "{requires_python}"\n'

            # Dependencies in PEP 508 format
            deps_list: List[str] = []
            for dep in sorted(self.dependencies, key=lambda d: d.name):
                name = dep.name.replace(".", "-")
                version = dep.version
                compatibility = dep.compatibility
                extras = dep.extras
                extras_str = ""
                if extras is not None:
                    extras_str = "[" + ",".join(extras) + "]"

                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version_spec = f">={version}"
                elif version.startswith(("^", "~")):
                    version_spec = self._convert_poetry_version_to_pep440(version)
                elif version.startswith((">=", "<=", "==", ">", "<")):
                    version_spec = version
                else:
                    version_spec = f"=={version}"

                dep_str = f"{name}{extras_str}{version_spec}"

                if dep.python is not None:
                    dep_str += f' ; python_version{dep.python}'

                deps_list.append(dep_str)

            s += 'dependencies = [\n'
            for dep_str in deps_list:
                s += f'    "{dep_str}",\n'
            s += ']\n'

            if project_urls:
                s += '\n[project.urls]\n'
                for url in project_urls:
                    s += url + '\n'

            s += '\n'
            return s

    @dataclass(frozen=True)
    class UvDependencyGroupsBlock(Block):
        """PEP 735 [dependency-groups] block for uv-compatible pyproject.toml."""
        dev_dependencies: Set[Dependency]
        enable_wire_tests: bool = False

        def _convert_poetry_version_to_pep440(self, version: str) -> str:
            """Convert Poetry version specifiers to PEP 440 format."""
            version = version.strip()
            if version.startswith("^"):
                base = version[1:]
                parts = base.split(".")
                major = int(parts[0])
                if major == 0 and len(parts) > 1:
                    minor = int(parts[1])
                    return f">={base},<{major}.{minor + 1}.0"
                return f">={base},<{major + 1}.0.0"
            if version.startswith("~"):
                base = version[1:]
                parts = base.split(".")
                major = int(parts[0])
                minor = int(parts[1]) if len(parts) > 1 else 0
                return f">={base},<{major}.{minor + 1}.0"
            return version

        def _dep_to_pep508(self, dep: Dependency) -> str:
            name = dep.name.replace(".", "-")
            version = dep.version
            compatibility = dep.compatibility
            extras = dep.extras
            extras_str = ""
            if extras is not None:
                extras_str = "[" + ",".join(extras) + "]"

            if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                version_spec = f">={version}"
            elif version.startswith(("^", "~")):
                version_spec = self._convert_poetry_version_to_pep440(version)
            elif version.startswith((">=", "<=", "==", ">", "<")):
                version_spec = version
            else:
                version_spec = f"=={version}"

            return f"{name}{extras_str}{version_spec}"

        def to_string(self) -> str:
            s = '[dependency-groups]\ndev = [\n'
            # Default dev dependencies
            s += '    "mypy==1.13.0",\n'
            s += '    "pytest>=7.4.0,<8.0.0",\n'
            s += '    "pytest-asyncio>=0.23.5,<1.0.0",\n'
            s += '    "pytest-xdist>=3.6.1,<4.0.0",\n'
            s += '    "python-dateutil>=2.9.0,<3.0.0",\n'
            s += '    "types-python-dateutil>=2.9.0.20240316",\n'

            if self.enable_wire_tests:
                s += '    "requests>=2.31.0,<3.0.0",\n'
                s += '    "types-requests>=2.31.0,<3.0.0",\n'

            for dep in sorted(self.dev_dependencies, key=lambda d: d.name):
                s += f'    "{self._dep_to_pep508(dep)}",\n'

            s += ']\n'
            return s

    @dataclass(frozen=True)
    class HatchBuildSystemBlock(Block):
        """Hatchling build system block for uv-compatible pyproject.toml."""
        package: PyProjectTomlPackageConfig

        def to_string(self) -> str:
            if self.package._from is not None:
                packages_path = f"{self.package._from}/{self.package.include}"
            else:
                packages_path = self.package.include

            return f"""
[tool.hatch.build.targets.wheel]
packages = ["{packages_path}"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
"""
