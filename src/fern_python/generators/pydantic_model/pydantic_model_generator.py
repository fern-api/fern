from generator_exec.resources.config import GeneratorConfig
from generator_exec.resources.logging import GeneratorUpdate, LogLevel, LogUpdate

from ...cli.abstract_generator import AbstractGenerator
from ...codegen import Project
from ...generated import ir_types
from ...generator_exec_wrapper import GeneratorExecWrapper
from ...logger import Logger
from .context import DeclarationHandlerContextImpl
from .custom_config import CustomConfig
from .type_declaration_handler import TypeDeclarationHandler
from .type_declaration_referencer import TypeDeclarationReferencer


class LoggerImpl(Logger):
    def log(self, content: str) -> None:
        print(content)


class PydanticModelGenerator(AbstractGenerator):
    def __init__(self) -> None:
        self._logger = LoggerImpl()

    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ) -> None:
        custom_config = CustomConfig.parse_obj(generator_config.custom_config or {})
        with Project(filepath=generator_config.output.path, project_name=f"{ir.api_name}") as project:
            type_declaration_referencer = TypeDeclarationReferencer(api_name=ir.api_name)
            for type_to_generate in ir.types:
                self._generate_type(
                    project,
                    ir=ir,
                    type=type_to_generate,
                    generator_exec_wrapper=generator_exec_wrapper,
                    custom_config=custom_config,
                    type_declaration_referencer=type_declaration_referencer,
                )

    def _generate_type(
        self,
        project: Project,
        ir: ir_types.IntermediateRepresentation,
        type: ir_types.TypeDeclaration,
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: CustomConfig,
        type_declaration_referencer: TypeDeclarationReferencer,
    ) -> None:
        filepath = type_declaration_referencer.get_filepath(type.name)
        with project.source_file(filepath=filepath) as source_file:
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generating {filepath}"))
            )
            context = DeclarationHandlerContextImpl(
                source_file=source_file,
                intermediate_representation=ir,
                type_declaration_referencer=type_declaration_referencer,
            )
            type_declaration_handler = TypeDeclarationHandler(
                declaration=type, context=context, logger=self._logger, custom_config=custom_config
            )
            type_declaration_handler.run()
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generated {filepath}"))
            )
