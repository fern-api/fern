from generator_exec.resources.logging import GeneratorUpdate, LogLevel, LogUpdate

from ...codegen import Project
from ...generated import ir_types
from ...generator_exec_wrapper import GeneratorExecWrapper
from ...logger import Logger
from .context import DeclarationHandlerContextImpl
from .filepaths import get_filepath_for_type
from .type_declaration_handler import TypeDeclarationHandler


class LoggerImpl(Logger):
    def log(self, content: str) -> None:
        print(content)


class PydanticModelGenerator:
    def __init__(
        self,
        intermediate_representation: ir_types.IntermediateRepresentation,
        output_filepath: str,
        generator_exec_wrapper: GeneratorExecWrapper,
    ):
        self._intermediate_representation = intermediate_representation
        self._output_filepath = output_filepath
        self._generator_exec_wrapper = generator_exec_wrapper
        self._logger = LoggerImpl()

    def run(self) -> None:
        with Project(
            filepath=self._output_filepath, project_name=f"{self._intermediate_representation.api_name}"
        ) as project:
            for type_to_generate in self._intermediate_representation.types:
                self._generate_type(project, type=type_to_generate)

    def _generate_type(self, project: Project, type: ir_types.TypeDeclaration) -> None:
        filepath = filepath = get_filepath_for_type(
            type_name=type.name,
            api_name=self._intermediate_representation.api_name,
        )
        with project.source_file(filepath=filepath) as source_file:
            context = DeclarationHandlerContextImpl(
                source_file=source_file,
                intermediate_representation=self._intermediate_representation,
            )
            type_declaration_handler = TypeDeclarationHandler(
                declaration=type,
                context=context,
                logger=self._logger,
            )
            type_declaration_handler.run()
            self._generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generated file {filepath}"))
            )
