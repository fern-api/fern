from __future__ import annotations

from typing import Optional, Set

from fern.generator_exec import GeneratorUpdate, LogLevel, LogUpdate

from fern_python.codegen import Filepath, SourceFile
from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.project import Project
from fern_python.codegen.reference_resolver_impl import ReferenceResolverImpl
from fern_python.codegen.source_file import SourceFileImpl
from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class SourceFileFactory:
    def __init__(self, *, should_format: bool):
        self._should_format = should_format

    def create(
        self,
        *,
        project: Project,
        filepath: Filepath,
        generator_exec_wrapper: GeneratorExecWrapper,
        from_src: Optional[bool] = True,
    ) -> SourceFile:
        self._log_generating_file_update(filepath=filepath, generator_exec_wrapper=generator_exec_wrapper)
        return project.source_file(filepath=filepath, from_src=from_src)

    def create_snippet(self) -> SourceFile:
        return SourceFileImpl(
            module_path=(),
            reference_resolver=ReferenceResolverImpl(
                module_path_of_source_file=(),
            ),
            dependency_manager=DependencyManager(),
            should_format=self._should_format,
            should_format_as_snippet=True,
            should_include_header=False,
        )

    @staticmethod
    def add_source_file_from_disk(
        *,
        project: Project,
        path_on_disk: str,
        filepath_in_project: Filepath,
        exports: Set[str],
        include_src_root: Optional[bool] = True,
        string_replacements: Optional[dict[str, str]] = None,
    ) -> None:
        project.add_source_file_from_disk(
            path_on_disk=path_on_disk,
            filepath_in_project=filepath_in_project,
            exports=exports,
            include_src_root=include_src_root,
            string_replacements=string_replacements,
        )

    def _log_generating_file_update(self, *, filepath: Filepath, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        generator_exec_wrapper.send_update(
            GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generating {filepath}"))
        )
