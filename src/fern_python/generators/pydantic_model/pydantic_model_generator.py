from typing import Tuple

import fern.ir.resources as ir_types
from fern.generator_exec.resources.config import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.source_file_factory import SourceFileFactory

from .context import PydanticGeneratorContext, PydanticGeneratorContextImpl
from .custom_config import PydanticModelCustomConfig
from .type_declaration_handler import TypeDeclarationHandler
from .type_declaration_handler.snippet_regsitry import SnippetRegistry
from .type_declaration_referencer import TypeDeclarationReferencer


class PydanticModelGenerator(AbstractGenerator):
    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = PydanticModelCustomConfig.parse_obj(generator_config.custom_config or {})
        return not custom_config.skip_formatting

    def get_relative_path_to_project_for_publish(
        self,
        *,
        generator_config: GeneratorConfig,
        ir: ir_types.IntermediateRepresentation,
    ) -> Tuple[str, ...]:
        return (
            generator_config.organization,
            ir.api_name.snake_case.unsafe_name,
        )

    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        custom_config = PydanticModelCustomConfig.parse_obj(generator_config.custom_config or {})
        context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(),
            generator_config=generator_config,
            project_module_path=self.get_relative_path_to_project_for_publish(
                generator_config=generator_config,
                ir=ir,
            ),
        )
        snippet_registry = SnippetRegistry(
            ir=ir,
            context=context,
        )
        self.generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            ir=ir,
            custom_config=custom_config,
            project=project,
            context=context,
            snippet_registry=snippet_registry,
        )
        context.core_utilities.copy_to_project(project=project)

    def generate_types(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        custom_config: PydanticModelCustomConfig,
        project: Project,
        context: PydanticGeneratorContext,
        snippet_registry: SnippetRegistry,
    ) -> None:
        for type_to_generate in ir.types.values():
            self._generate_type(
                project,
                type=type_to_generate,
                generator_exec_wrapper=generator_exec_wrapper,
                custom_config=custom_config,
                context=context,
                snippet_registry=snippet_registry,
            )

    def _generate_type(
        self,
        project: Project,
        type: ir_types.TypeDeclaration,
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: PydanticModelCustomConfig,
        context: PydanticGeneratorContext,
        snippet_registry: SnippetRegistry,
    ) -> None:
        filepath = context.get_filepath_for_type_name(type_name=type.name)
        source_file = SourceFileFactory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        type_declaration_handler = TypeDeclarationHandler(
            declaration=type,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            snippet_registry=snippet_registry,
        )
        type_declaration_handler.run()
        project.write_source_file(source_file=source_file, filepath=filepath)

    def get_sorted_modules(self) -> None:
        return None

    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        return False
