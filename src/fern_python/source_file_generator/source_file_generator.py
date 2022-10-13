from __future__ import annotations

from typing import Set

from generator_exec.resources import GeneratorUpdate, LogLevel, LogUpdate

from fern_python.codegen import Filepath, SourceFile
from fern_python.codegen.project import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class SourceFileGenerator:
    @staticmethod
    def generate(
        *,
        project: Project,
        filepath: Filepath,
        generator_exec_wrapper: GeneratorExecWrapper,
    ) -> SourceFile:
        SourceFileGenerator._log_generating_file_update(
            filepath=filepath,
            generator_exec_wrapper=generator_exec_wrapper,
        )
        return project.source_file(filepath=filepath)

    @staticmethod
    def add_source_file_from_disk(
        *, project: Project, path_on_disk: str, filepath_in_project: Filepath, exports: Set[str]
    ) -> None:
        project.add_source_file_from_disk(
            path_on_disk=path_on_disk,
            filepath_in_project=filepath_in_project,
            exports=exports,
        )

    @staticmethod
    def _log_generating_file_update(*, filepath: Filepath, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        generator_exec_wrapper.send_update(
            GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generating {filepath}"))
        )
