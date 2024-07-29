from typing import Literal, Tuple

import fern.ir.resources as ir_types
from fern.generator_exec.resources.config import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model.typeddict import FernTypedDict
from fern_python.snippet import SnippetRegistry, SnippetWriter
from fern_python.source_file_factory import SourceFileFactory

from ..context import PydanticGeneratorContext, PydanticGeneratorContextImpl
from .custom_config import PydanticModelCustomConfig
from .type_declaration_handler import (
    TypeDeclarationHandler,
    TypeDeclarationSnippetGeneratorBuilder,
)
from .type_declaration_referencer import TypeDeclarationReferencer


class PydanticModelGenerator(AbstractGenerator):
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]:
        return "pydantic"

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
            ir.api_name.snake_case.safe_name,
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
            type_declaration_referencer=TypeDeclarationReferencer(
                use_typeddict_requests=custom_config.use_typeddict_requests, types=ir.types
            ),
            generator_config=generator_config,
            project_module_path=self.get_relative_path_to_project_for_publish(
                generator_config=generator_config,
                ir=ir,
            ),
            allow_skipping_validation=custom_config.skip_validation,
            allow_leveraging_defaults=custom_config.use_provided_defaults,
            use_typeddict_requests=custom_config.use_typeddict_requests,
            use_str_enums=custom_config.use_str_enums,
        )
        snippet_registry = SnippetRegistry()
        snippet_writer = self._build_snippet_writer(
            context=context, improved_imports=False, use_str_enums=custom_config.use_str_enums
        )
        self.generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            ir=ir,
            custom_config=custom_config,
            project=project,
            context=context,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
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
        snippet_writer: SnippetWriter,
    ) -> None:
        for type_to_generate in ir.types.values():
            self._generate_type(
                project,
                type=type_to_generate,
                generator_exec_wrapper=generator_exec_wrapper,
                custom_config=custom_config,
                context=context,
                snippet_registry=snippet_registry,
                snippet_writer=snippet_writer,
            )

    def _should_generate_typedict(self, context: PydanticGeneratorContext, type_: ir_types.Type) -> bool:
        return context.use_typeddict_requests and FernTypedDict.can_be_typeddict(type_, context.ir.types)

    def _generate_type(
        self,
        project: Project,
        type: ir_types.TypeDeclaration,
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: PydanticModelCustomConfig,
        context: PydanticGeneratorContext,
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
    ) -> None:
        # TODO: Actually flag typeddicts if they're request object ONLY, right now we just always create
        # the typeddict for any object. This is fine for now, but we should be able to filter the types down.

        # Write the typeddict request
        if self._should_generate_typedict(context=context, type_=type.shape):
            typeddict_filepath = context.get_filepath_for_type_id(type_id=type.name.type_id, as_request=True)
            typeddict_source_file = SourceFileFactory.create(
                project=project, filepath=typeddict_filepath, generator_exec_wrapper=generator_exec_wrapper
            )

            typeddict_handler = TypeDeclarationHandler(
                declaration=type,
                context=context,
                custom_config=custom_config,
                source_file=typeddict_source_file,
                snippet_writer=snippet_writer,
                generate_typeddict_request=True,
            )
            typeddict_handler.run()

            project.write_source_file(source_file=typeddict_source_file, filepath=typeddict_filepath)

        # Write the pydantic model
        filepath = context.get_filepath_for_type_id(type_id=type.name.type_id, as_request=False)
        source_file = SourceFileFactory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )

        type_declaration_handler = TypeDeclarationHandler(
            declaration=type,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            snippet_writer=snippet_writer,
            generate_typeddict_request=False,
        )
        generated_type = type_declaration_handler.run()
        if generated_type.snippet is not None:
            snippet_registry.register_snippet(
                type_id=type.name.type_id,
                expr=generated_type.snippet,
            )
        project.write_source_file(source_file=source_file, filepath=filepath)

    def get_sorted_modules(self) -> None:
        return None

    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        return False

    def _build_snippet_writer(
        self, context: PydanticGeneratorContext, improved_imports: bool = False, use_str_enums: bool = False
    ) -> SnippetWriter:
        """
        Note that this function is a copy of the function with the same name in
        the fern_python.utils package. This is redeclared here to prevent an import
        cycle.
        """
        snippet_writer = SnippetWriter(
            context=context,
            improved_imports=improved_imports,
        )

        builder = TypeDeclarationSnippetGeneratorBuilder(
            context=context,
            snippet_writer=snippet_writer,
        )
        type_declaration_snippet_generator = builder.get_generator()

        snippet_writer._type_declaration_snippet_generator = type_declaration_snippet_generator

        return snippet_writer
