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

from fern.generator_exec import (
    BasicLicense,
    GithubOutputMode,
    LicenseConfig,
    LicenseId,
    PypiMetadata,
)

DEFAULT_UV_VERSION = "0.0.1"

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
        pyproject_format: str = "poetry",
    ):
        self._name = name
        self._version = version
        self._poetry_block = PyProjectToml.PoetryBlock(
            name=name,
            version=version,
            package=package,
            pypi_metadata=pypi_metadata,
            github_output_mode=github_output_mode,
            license_=license_,
        )
        self._poetry_v2_block = PyProjectToml.PoetryV2Block(
            name=name,
            version=version,
            package=package,
            pypi_metadata=pypi_metadata,
            github_output_mode=github_output_mode,
            license_=license_,
            dependency_manager=dependency_manager,
            python_version=python_version,
        )
        self._uv_block = PyProjectToml.UVBlock(
            name=name,
            version=version,
            package=package,
            pypi_metadata=pypi_metadata,
            github_output_mode=github_output_mode,
            license_=license_,
            dependency_manager=dependency_manager,
            python_version=python_version,
        )
        self._dependency_manager = dependency_manager
        self._path = path
        self._python_version = python_version
        self._extras = extras
        self._user_defined_toml = user_defined_toml
        self._pyproject_format = pyproject_format

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

        content = ""

        if self._pyproject_format == "uv":
            content += self._uv_block.to_string()
        elif self._pyproject_format == "poetry_v2":
            content += self._poetry_v2_block.to_string()
        else:
            # For poetry v1 format, use the poetry blocks
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
    class PoetryV2Block(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]
        dependency_manager: DependencyManager
        python_version: str

        def to_string(self) -> str:
            # Get dependencies from the dependency manager
            dependencies = []
            dev_dependencies = []
            
            # Map main dependencies
            for dep in self.dependency_manager.get_dependencies():
                if dep.name == "python":
                    continue  # Skip python version, handled separately
                compatibility = dep.compatibility
                version = dep.version
                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"
                dep_str = f"{dep.name}{version}"
                dependencies.append(dep_str)
            
            # Map dev dependencies
            for dep in self.dependency_manager.get_dev_dependencies():
                compatibility = dep.compatibility
                version = dep.version
                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"
                dep_str = f"{dep.name}{version}"
                dev_dependencies.append(dep_str)
            
            # Initialize metadata
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
                "Topic :: Software Development :: Libraries :: Python Modules",
                "Typing :: Typed",
            ]
            license_evaluated = ""
            
            # Apply pypi metadata if available
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

            # Apply license if available
            if self.license_ is not None:
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        license_evaluated = 'license = {text = "MIT"}'
                        classifiers.append("License :: OSI Approved :: MIT License")
                    elif license_id == LicenseId.APACHE_2:
                        license_evaluated = 'license = {text = "Apache-2.0"}'
                        classifiers.append("License :: OSI Approved :: Apache Software License")

            # Apply github output mode if available
            if self.github_output_mode is not None:
                project_urls.append(f"Repository = '{self.github_output_mode.repo_url}'")

            # Get python version from dependency manager
            python_version = ">=3.8"  # Default
            for dep in self.dependency_manager.get_dependencies():
                if dep.name == "python":
                    python_version = dep.version_specifier.replace("^", ">=").replace("~", ">=")
                    break

            # Format authors for Poetry v2 format
            authors_str = "[]"
            if authors:
                authors_list = []
                for author in authors:
                    if " <" in author and ">" in author:
                        name, email = author.split(" <")
                        email = email.rstrip(">")
                        authors_list.append(f'{{name = "{name}", email = "{email}"}}')
                    else:
                        authors_list.append(f'{{name = "{author}"}}')
                authors_str = f"[{', '.join(authors_list)}]"

            # Format project URLs
            stringified_project_urls = ""
            if len(project_urls) > 0:
                stringified_project_urls = "\n[project.urls]\n" + "\n".join(project_urls) + "\n"

            # Build the Poetry v2 format content using PEP 621 [project] format + [tool.poetry]
            s = f'''[project]
name = "{self.name}"
version = "{self.version or DEFAULT_UV_VERSION}"
description = "{description}"
readme = "README.md"
authors = {authors_str}
keywords = {json.dumps(keywords, indent=4)}
classifiers = {json.dumps(classifiers, indent=4)}
requires-python = "{python_version}"
dependencies = [
{chr(10).join([f'    "{dep}",' for dep in dependencies])}
]

[project.optional-dependencies]
dev = [
{chr(10).join([f'    "{dep}",' for dep in dev_dependencies])}
]{stringified_project_urls}

[tool.poetry]
name = "{self.name}"
version = "{self.version or DEFAULT_UV_VERSION}"
description = "{description}"
authors = {authors_str}
packages = [
    {{ include = "{self.package.include}", from = "{self.package._from or 'src'}"}}
]

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
'''
            return s

    @dataclass(frozen=True)
    class UVBlock(Block):
        name: str
        version: Optional[str]
        package: PyProjectTomlPackageConfig
        pypi_metadata: Optional[PypiMetadata]
        github_output_mode: Optional[GithubOutputMode]
        license_: Optional[LicenseConfig]
        dependency_manager: DependencyManager
        python_version: str

        def to_string(self) -> str:
            # Get dependencies from the dependency manager
            dependencies = []
            dev_dependencies = []
            
            # Map main dependencies
            for dep in self.dependency_manager.get_dependencies():
                if dep.name == "python":
                    continue  # Skip python version, handled separately
                compatibility = dep.compatibility
                version = dep.version
                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"
                dep_str = f"{dep.name}{version}"
                dependencies.append(dep_str)
            
            # Map dev dependencies
            for dep in self.dependency_manager.get_dev_dependencies():
                compatibility = dep.compatibility
                version = dep.version
                if compatibility == DependencyCompatibility.GREATER_THAN_OR_EQUAL:
                    version = f">={dep.version}"
                dep_str = f"{dep.name}{version}"
                dev_dependencies.append(dep_str)
            
            # Initialize metadata
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
                "Topic :: Software Development :: Libraries :: Python Modules",
                "Typing :: Typed",
            ]
            license_evaluated = ""
            
            # Apply pypi metadata if available
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

            # Apply license if available
            if self.license_ is not None:
                if self.license_.get_as_union().type == "basic":
                    license_id = cast(BasicLicense, self.license_.get_as_union()).id
                    if license_id == LicenseId.MIT:
                        license_evaluated = 'license = {text = "MIT"}'
                        classifiers.append("License :: OSI Approved :: MIT License")
                    elif license_id == LicenseId.APACHE_2:
                        license_evaluated = 'license = {text = "Apache-2.0"}'
                        classifiers.append("License :: OSI Approved :: Apache Software License")

            # Apply github output mode if available
            if self.github_output_mode is not None:
                project_urls.append(f"Repository = '{self.github_output_mode.repo_url}'")

            # Get python version from dependency manager
            python_version = ">=3.8"  # Default
            for dep in self.dependency_manager.get_dependencies():
                if dep.name == "python":
                    python_version = dep.version_specifier.replace("^", ">=").replace("~", ">=")
                    break

            # Format authors for UV format
            authors_str = "[]"
            if authors:
                authors_list = []
                for author in authors:
                    if " <" in author and ">" in author:
                        name, email = author.split(" <")
                        email = email.rstrip(">")
                        authors_list.append(f'{{name = "{name}", email = "{email}"}}')
                    else:
                        authors_list.append(f'{{name = "{author}"}}')
                authors_str = f"[{', '.join(authors_list)}]"

            # Format project URLs
            stringified_project_urls = ""
            if len(project_urls) > 0:
                stringified_project_urls = "\n[project.urls]\n" + "\n".join(project_urls) + "\n"

            # Build the UV format content
            s = f'''[project]
name = "{self.name}"
version = "{self.version or DEFAULT_UV_VERSION}"
description = "{description}"
readme = "README.md"
authors = {authors_str}
keywords = {json.dumps(keywords, indent=4)}
classifiers = {json.dumps(classifiers, indent=4)}
requires-python = "{python_version}"
dependencies = [
{chr(10).join([f'    "{dep}",' for dep in dependencies])}
]

[project.optional-dependencies]
dev = [
{chr(10).join([f'    "{dep}",' for dep in dev_dependencies])}
]{stringified_project_urls}

[tool.hatch.build.targets.wheel]
packages = ["src"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
'''
            return s

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
