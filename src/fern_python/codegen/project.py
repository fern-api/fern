from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from types import TracebackType
from typing import Optional, Type

from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig

from . import AST
from .dependency_manager import DependencyManager
from .filepath import Filepath
from .module_manager import ModuleManager
from .reference_resolver_impl import ReferenceResolverImpl
from .source_file import SourceFile, SourceFileImpl


@dataclass(frozen=True)
class PublishConfig:
    package_name: str
    package_version: str


class Project:
    """
    with Project("/path/to/project") as project:
        ...
    """

    def __init__(
        self,
        filepath: str,
        project_name: str,
        python_version: str = "3.7",
        publish_config: PublishConfig = None,
        generate_py_typed: bool = False,
    ) -> None:
        self._root_filepath = filepath
        self._project_filepath = os.path.join(filepath, "src")
        self._project_name = project_name
        self._publish_config = publish_config
        self._module_manager = ModuleManager()
        self._python_version = python_version
        self._dependency_manager = DependencyManager()
        self._generate_py_typed = generate_py_typed

    def source_file(self, filepath: Filepath) -> SourceFile:
        """
        with project.source_file() as source_file:
            ...
        """

        def on_finish(source_file: SourceFileImpl) -> None:
            self._module_manager.register_source_file(
                filepath=filepath,
                source_file=source_file,
            )

        module = filepath.to_module()
        source_file = SourceFileImpl(
            filepath=os.path.join(
                self._get_root_module_filepath(),
                *(directory.module_name for directory in filepath.directories),
                f"{filepath.file.module_name}.py",
            ),
            module_path=module.path,
            completion_listener=on_finish,
            reference_resolver=ReferenceResolverImpl(
                project_name=self._project_name,
                module_path_of_source_file=module.path,
            ),
            dependency_manager=self._dependency_manager,
        )
        return source_file

    def add_dependency(self, dependency: AST.Dependency) -> None:
        self._dependency_manager.add_dependency(dependency)

    def start(self) -> None:
        if os.path.exists(self._project_filepath):
            shutil.rmtree(self._project_filepath)

    def finish(self) -> None:
        self._module_manager.write_modules(filepath=self._get_root_module_filepath())
        if self._publish_config is not None:
            # generate pyproject.toml
            py_project_toml = PyProjectToml(
                name=self._publish_config.package_name,
                version=self._publish_config.package_version,
                package=PyProjectTomlPackageConfig(include=self._project_name, _from="src"),
                path=self._root_filepath,
                dependency_manager=self._dependency_manager,
                python_version=self._python_version,
            )
            py_project_toml.write()
            # generate py.typed
            with open(os.path.join(self._get_root_module_filepath(), "py.typed"), "w") as f:
                f.write("")

    def _get_root_module_filepath(self) -> str:
        return os.path.join(self._project_filepath, self._project_name)

    def __enter__(self) -> Project:
        self.start()
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
