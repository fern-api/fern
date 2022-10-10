from __future__ import annotations

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
        generator_exec_wrapper.send_update(
            GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generating {filepath}"))
        )
        return project.source_file(filepath=filepath)
