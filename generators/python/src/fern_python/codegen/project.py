from __future__ import annotations

import os
import typing
from dataclasses import dataclass
from pathlib import Path
from types import TracebackType
from typing import List, Optional, Sequence, Set, Type

from .dependency_manager import DependencyManager
from .filepath import Filepath
from .module_manager import ModuleExport, ModuleManager
from .reference_resolver_impl import ReferenceResolverImpl
from .source_file import SourceFile, SourceFileImpl
from .writer_impl import WriterImpl
from fern_python.codegen import AST
from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig
from fern_python.codegen.requirements_txt import RequirementsTxt

from fern.generator_exec import GithubOutputMode, LicenseConfig, PypiMetadata


@dataclass(frozen=True)
class ProjectConfig:
    package_name: str
    package_version: str


class Project:
    """
    with Project(...) as project:
        ...
    """

    def __init__(
        self,
        *,
        filepath: str,
        relative_path_to_project: str,
        python_version: str = "^3.8",
        project_config: Optional[ProjectConfig] = None,
        sorted_modules: Optional[Sequence[str]] = None,
        flat_layout: bool = False,
        whitelabel: bool = False,
        pypi_metadata: Optional[PypiMetadata],
        github_output_mode: Optional[GithubOutputMode],
        license_: Optional[LicenseConfig],
        user_defined_toml: Optional[str] = None,
        exclude_types_from_init_exports: Optional[bool] = False,
        lazy_imports: bool = True,
        recursion_limit: Optional[int] = None,
    ) -> None:
        relative_path_to_project = relative_path_to_project.replace(".", "/")
        if flat_layout:
            self._project_relative_filepath = relative_path_to_project
        else:
            self._project_relative_filepath = os.path.join("src", relative_path_to_project)

        self._project_filepath = (
            filepath if project_config is None else os.path.join(filepath, self._project_relative_filepath)
        )
        self._generate_readme = True
        self._root_filepath = filepath
        self._relative_path_to_project = relative_path_to_project
        self._project_config = project_config
        self._module_manager = ModuleManager(
            sorted_modules=sorted_modules, lazy_imports=lazy_imports, recursion_limit=recursion_limit
        )
        self._python_version = python_version
        self._dependency_manager = DependencyManager()
        self._whitelabel = whitelabel
        self._github_output_mode = github_output_mode
        self._pypi_metadata = pypi_metadata
        self.license_ = license_
        self._extras: typing.Dict[str, List[str]] = {}
        self._user_defined_toml = user_defined_toml
        self._exclude_types_from_init_exports = exclude_types_from_init_exports

    def add_init_exports(self, path: AST.ModulePath, exports: List[ModuleExport]) -> None:
        self._module_manager.register_additional_exports(path, exports)

    def add_dependency(self, dependency: AST.Dependency) -> None:
        self._dependency_manager.add_dependency(dependency)

    def add_dev_dependency(self, dependency: AST.Dependency) -> None:
        self._dependency_manager.add_dev_dependency(dependency)

    def add_extra(self, extra: typing.Dict[str, List[str]]) -> None:
        self._extras = extra

    def set_generate_readme(self, generate_readme: bool) -> None:
        self._generate_readme = generate_readme

    def source_file(self, filepath: Filepath, from_src: Optional[bool] = True) -> SourceFile:
        """
        with project.source_file() as source_file:
            ...
        """

        def on_finish(source_file: SourceFileImpl) -> None:
            include_exports = not self._exclude_types_from_init_exports
            self._module_manager.register_exports(
                filepath=filepath, exports=source_file.get_exports() if include_exports else set(), from_src=from_src
            )

        module = filepath.to_module()
        source_file = SourceFileImpl(
            module_path=module.path,
            completion_listener=on_finish,
            reference_resolver=ReferenceResolverImpl(
                module_path_of_source_file=module.path,
            ),
            dependency_manager=self._dependency_manager,
            should_format=False,
            whitelabel=self._whitelabel,
        )
        return source_file

    def write_source_file(
        self, *, source_file: SourceFile, filepath: Filepath, include_src_root: Optional[bool] = True
    ) -> None:
        source_file.write_to_file(
            filepath=self.get_source_file_filepath(
                filepath, include_src_root=(include_src_root if include_src_root is not None else True)
            )
        )

    def get_relative_source_file_filepath(self, filepath: Filepath) -> str:
        return os.path.join(self._project_relative_filepath, str(filepath))

    def get_source_file_filepath(self, filepath: Filepath, include_src_root: bool) -> str:
        return (
            os.path.join(self._project_filepath, str(filepath))
            if include_src_root
            else os.path.join(self._root_filepath, str(filepath))
        )

    def register_export_in_project(self, filepath_in_project: Filepath, exports: Set[str]) -> None:
        self._module_manager.register_exports(
            filepath=filepath_in_project,
            exports=exports,
        )

    def add_source_file_from_disk(
        self,
        *,
        path_on_disk: str,
        filepath_in_project: Filepath,
        exports: Set[str],
        include_src_root: Optional[bool] = True,
        string_replacements: Optional[dict[str, str]] = None,
    ) -> None:
        with open(path_on_disk, "r") as existing_file:
            writer = WriterImpl(should_format=False, should_sort_imports=True)
            read_file = existing_file.read()
            if string_replacements is not None:
                for k, v in string_replacements.items():
                    read_file = read_file.replace(k, v)

            writer.write(read_file)
            writer.write_to_file(
                filepath=self.get_source_file_filepath(
                    filepath_in_project, include_src_root=(include_src_root if include_src_root is not None else True)
                )
            )
        if include_src_root:
            self._module_manager.register_exports(
                filepath=filepath_in_project,
                exports=exports,
            )

    def add_file(self, filepath: str, contents: str) -> None:
        file = Path(os.path.join(self._root_filepath, filepath))
        file.parent.mkdir(exist_ok=True, parents=True)
        file.write_text(contents)

    def finish(self) -> None:
        self._module_manager.write_modules(base_filepath=self._root_filepath, filepath=self._project_filepath)
        if self._project_config is not None:
            # generate pyproject.toml
            py_project_toml = PyProjectToml(
                name=self._project_config.package_name,
                version=self._project_config.package_version,
                package=PyProjectTomlPackageConfig(include=self._relative_path_to_project, _from="src"),
                path=self._root_filepath,
                dependency_manager=self._dependency_manager,
                python_version=self._python_version,
                github_output_mode=self._github_output_mode,
                pypi_metadata=self._pypi_metadata,
                license_=self.license_,
                extras=self._extras,
                user_defined_toml=self._user_defined_toml,
            )
            py_project_toml.write()

            # generate requirements.txt
            requirements_txt = RequirementsTxt(self._root_filepath, self._dependency_manager)
            requirements_txt.write()

            # generate py.typed
            with open(os.path.join(self._project_filepath, "py.typed"), "w") as f:
                f.write("")

            # generate empty README so poetry doesn't fail
            if self._generate_readme:
                with open(os.path.join(self._root_filepath, "README.md"), "w") as f:
                    f.write("")

            # copy LICENSE file if custom license is specified
            self._copy_license_file()

    def _copy_license_file(self) -> None:
        """Copy LICENSE file from /tmp/LICENSE to project root for local generation."""
        if self.license_ is not None:
            license_union = self.license_.get_as_union()
            if license_union.type == "custom":
                # In Docker execution environment (local generation), the license file is mounted at /tmp/LICENSE
                # For remote generation, Fiddle handles writing the LICENSE file after generation
                docker_license_path = "/tmp/LICENSE"
                destination_path = os.path.join(self._root_filepath, license_union.filename)

                try:
                    import shutil
                    shutil.copyfile(docker_license_path, destination_path)
                except FileNotFoundError:
                    # File not found - this is expected for remote generation where Fiddle handles it
                    pass
                except Exception:
                    # Silently fail for any other errors to maintain backwards compatibility
                    pass

    def __enter__(self) -> Project:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
