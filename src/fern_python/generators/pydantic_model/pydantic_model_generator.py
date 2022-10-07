from generator_exec.resources.config import GeneratorConfig
from generator_exec.resources.logging import GeneratorUpdate, LogLevel, LogUpdate

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generated import ir_types
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

from .context import DeclarationHandlerContextImpl
from .custom_config import CustomConfig
from .type_declaration_handler import TypeDeclarationHandler
from .type_declaration_referencer import TypeDeclarationReferencer


class PydanticModelGenerator(AbstractGenerator):
    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        custom_config = CustomConfig.parse_obj(generator_config.custom_config or {})
        self.generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            ir=ir,
            custom_config=custom_config,
            project=project,
            type_declaration_referencer=TypeDeclarationReferencer(api_name=ir.api_name),
        )

    def generate_types(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        custom_config: CustomConfig,
        project: Project,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
    ) -> None:
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
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
    ) -> None:
        filepath = type_declaration_referencer.get_filepath(name=type.name)
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
                declaration=type, context=context, custom_config=custom_config
            )
            type_declaration_handler.run()
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.log(LogUpdate(level=LogLevel.DEBUG, message=f"Generated {filepath}"))
            )
