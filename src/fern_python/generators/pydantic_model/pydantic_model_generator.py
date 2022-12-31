import fern.ir_v1.pydantic as ir_types
from generator_exec.resources.config import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.source_file_generator import SourceFileGenerator

from .context import PydanticGeneratorContext, PydanticGeneratorContextImpl
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
            context=PydanticGeneratorContextImpl(
                intermediate_representation=ir,
                type_declaration_referencer=TypeDeclarationReferencer(
                    generator_config=generator_config,
                    ir=ir,
                ),
            ),
        )

    def generate_types(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        custom_config: CustomConfig,
        project: Project,
        context: PydanticGeneratorContext,
    ) -> None:
        for type_to_generate in ir.types:
            self._generate_type(
                project,
                ir=ir,
                type=type_to_generate,
                generator_exec_wrapper=generator_exec_wrapper,
                custom_config=custom_config,
                context=context,
            )

    def _generate_type(
        self,
        project: Project,
        ir: ir_types.IntermediateRepresentation,
        type: ir_types.TypeDeclaration,
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: CustomConfig,
        context: PydanticGeneratorContext,
    ) -> None:
        filepath = context.get_filepath_for_type_name(type_name=type.name)
        with SourceFileGenerator.generate(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        ) as source_file:
            type_declaration_handler = TypeDeclarationHandler(
                declaration=type,
                context=context,
                custom_config=custom_config,
                source_file=source_file,
            )
            type_declaration_handler.run()
