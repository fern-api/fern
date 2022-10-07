from generator_exec.resources.config import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generated import ir_types
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model import (
    PydanticModelCustomConfig,
    PydanticModelGenerator,
)

from .type_declaration_referencer import TypeDeclarationReferencer


class FastApiGenerator(AbstractGenerator):
    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        pydantic_model_generator = PydanticModelGenerator()
        pydantic_model_generator.generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            custom_config=PydanticModelCustomConfig.parse_obj({}),
            ir=ir,
            project=project,
            type_declaration_referencer=TypeDeclarationReferencer(ir=ir, generator_config=generator_config),
        )
