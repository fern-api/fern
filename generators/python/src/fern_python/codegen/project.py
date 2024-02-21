from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from types import TracebackType
from typing import List, Optional, Sequence, Set, Type

from fern_python.codegen import AST
from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig

from .dependency_manager import DependencyManager
from .filepath import Filepath
from .module_manager import ModuleExport, ModuleManager
from .reference_resolver_impl import ReferenceResolverImpl
from .source_file import SourceFile, SourceFileImpl
from .writer_impl import WriterImpl


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
        python_version: str = "3.8",
        project_config: ProjectConfig = None,
        should_format_files: bool,
        sorted_modules: Optional[Sequence[str]] = None,
        flat_layout: bool = False,
        whitelabel: bool = False,
    ) -> None:
        if flat_layout:
            self._project_filepath = (
                filepath if project_config is None else os.path.join(filepath, relative_path_to_project)
            )
        else:
            self._project_filepath = (
                filepath if project_config is None else os.path.join(filepath, "src", relative_path_to_project)
            )
        self._generate_readme = True
        self._root_filepath = filepath
        self._relative_path_to_project = relative_path_to_project
        self._project_config = project_config
        self._module_manager = ModuleManager(should_format=should_format_files, sorted_modules=sorted_modules)
        self._python_version = python_version
        self._dependency_manager = DependencyManager()
        self._should_format_files = should_format_files
        self._whitelabel = whitelabel

    def add_init_exports(self, path: AST.ModulePath, exports: List[ModuleExport]) -> None:
        self._module_manager.register_additional_exports(path, exports)

    def add_dependency(self, dependency: AST.Dependency) -> None:
        self._dependency_manager.add_dependency(dependency)

    def set_generate_readme(self, generate_readme: bool) -> None:
        self._generate_readme = generate_readme

    def source_file(self, filepath: Filepath) -> SourceFile:
        """
        with project.source_file() as source_file:
            ...
        """

        def on_finish(source_file: SourceFileImpl) -> None:
            self._module_manager.register_exports(
                filepath=filepath,
                exports=source_file.get_exports(),
            )

        module = filepath.to_module()
        source_file = SourceFileImpl(
            module_path=module.path,
            completion_listener=on_finish,
            reference_resolver=ReferenceResolverImpl(
                module_path_of_source_file=module.path,
            ),
            dependency_manager=self._dependency_manager,
            should_format=self._should_format_files,
            whitelabel=self._whitelabel,
        )
        return source_file

    def write_source_file(self, *, source_file: SourceFile, filepath: Filepath) -> None:
        source_file.write_to_file(filepath=self.get_source_file_filepath(filepath))

    def get_source_file_filepath(self, filepath: Filepath) -> str:
        return os.path.join(self._project_filepath, str(filepath))

    def add_source_file_from_disk(self, *, path_on_disk: str, filepath_in_project: Filepath, exports: Set[str]) -> None:
        with open(path_on_disk, "r") as existing_file:
            writer = WriterImpl(should_format=self._should_format_files)
            writer.write(existing_file.read())
            writer.write_to_file(filepath=self.get_source_file_filepath(filepath_in_project))
        self._module_manager.register_exports(
            filepath=filepath_in_project,
            exports=exports,
        )

    def add_file(self, filepath: str, contents: str) -> None:
        file = Path(os.path.join(self._root_filepath, filepath))
        file.parent.mkdir(exist_ok=True, parents=True)
        file.write_text(contents)

    def finish(self) -> None:
        self._module_manager.write_modules(filepath=self._project_filepath)
        if self._project_config is not None:
            # generate pyproject.toml
            py_project_toml = PyProjectToml(
                name=self._project_config.package_name,
                version=self._project_config.package_version,
                package=PyProjectTomlPackageConfig(include=self._relative_path_to_project, _from="src"),
                path=self._root_filepath,
                dependency_manager=self._dependency_manager,
                python_version=self._python_version,
            )
            py_project_toml.write()

            # generate py.typed
            with open(os.path.join(self._project_filepath, "py.typed"), "w") as f:
                f.write("")

            # generate empty README so poetry doesn't fail
            if self._generate_readme:
                with open(os.path.join(self._root_filepath, "README.md"), "w") as f:
                    f.write("")

    def __enter__(self) -> Project:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
