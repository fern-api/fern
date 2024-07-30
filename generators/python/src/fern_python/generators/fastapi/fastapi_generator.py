from typing import Literal, Tuple

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model import (
    PydanticModelCustomConfig,
    PydanticModelGenerator,
)
from fern_python.snippet import SnippetRegistry
from fern_python.source_file_factory import SourceFileFactory
from fern_python.utils import build_snippet_writer

from .auth import SecurityFileGenerator
from .context import FastApiGeneratorContext, FastApiGeneratorContextImpl
from .custom_config import FastAPICustomConfig
from .error_generator import ErrorGenerator
from .fern_http_exception import FernHTTPExceptionGenerator
from .inlined_request_generator import InlinedRequestGenerator
from .register import RegisterFileGenerator
from .service_generator import ServiceGenerator


class FastApiGenerator(AbstractGenerator):
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]:
        return "fastapi"

    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = FastAPICustomConfig.parse_obj(generator_config.custom_config or {})
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
        custom_config = FastAPICustomConfig.parse_obj(generator_config.custom_config or {})
        self._pydantic_model_custom_config = PydanticModelCustomConfig(
            include_union_utils=True,
            include_validators=custom_config.include_validators,
            skip_formatting=custom_config.skip_formatting,
            # FastAPI generator config only exposes base pydantic settings.
            # To merge the base config into the final pydantic config, we need to
            # cast BasePydanticModelCustomConfig to dict and unpack into kwargs
            **custom_config.pydantic_config.dict(),
        )

        context = FastApiGeneratorContextImpl(
            ir=ir,
            generator_config=generator_config,
            project_module_path=self.get_relative_path_to_project_for_publish(
                generator_config=generator_config,
                ir=ir,
            ),
            use_str_enums=self._pydantic_model_custom_config.use_str_enums,
        )

        snippet_registry = SnippetRegistry()
        snippet_writer = build_snippet_writer(
            context=context.pydantic_generator_context,
            improved_imports=False,
            use_str_enums=self._pydantic_model_custom_config.use_str_enums,
        )

        PydanticModelGenerator().generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            custom_config=self._pydantic_model_custom_config,
            ir=ir,
            project=project,
            context=context.pydantic_generator_context,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
        )

        for service in ir.services.values():
            self._generate_service(
                context=context,
                ir=ir,
                generator_exec_wrapper=generator_exec_wrapper,
                service=service,
                project=project,
            )

        for error in ir.errors.values():
            self._generate_error(
                context=context,
                ir=ir,
                generator_exec_wrapper=generator_exec_wrapper,
                error=error,
                project=project,
            )

        SecurityFileGenerator(context=context).generate_security_file(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
        )

        RegisterFileGenerator(context=context).generate_registry_file(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
        )

        FernHTTPExceptionGenerator(context=context, custom_config=custom_config).generate(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
        )

        context.core_utilities.copy_to_project(project=project)

    def _generate_service(
        self,
        context: FastApiGeneratorContext,
        ir: ir_types.IntermediateRepresentation,
        generator_exec_wrapper: GeneratorExecWrapper,
        service: ir_types.HttpService,
        project: Project,
    ) -> None:
        filepath = context.get_filepath_for_service(service.name)
        service_file = SourceFileFactory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        ServiceGenerator(context=context, service=service).generate(source_file=service_file)
        project.write_source_file(source_file=service_file, filepath=filepath)

        for endpoint in service.endpoints:
            if endpoint.request_body is not None:
                request_body = endpoint.request_body.get_as_union()
                if request_body.type == "inlinedRequestBody":
                    inlined_request_filepath = context.get_filepath_for_inlined_request(
                        service_name=service.name, request=request_body
                    )
                    inlined_request_source_file = SourceFileFactory.create(
                        project=project,
                        filepath=inlined_request_filepath,
                        generator_exec_wrapper=generator_exec_wrapper,
                    )
                    InlinedRequestGenerator(
                        context=context,
                        service=service,
                        request=request_body,
                        pydantic_model_custom_config=self._pydantic_model_custom_config,
                    ).generate(
                        source_file=inlined_request_source_file,
                    )
                    project.write_source_file(
                        source_file=inlined_request_source_file, filepath=inlined_request_filepath
                    )

    def _generate_error(
        self,
        context: FastApiGeneratorContext,
        ir: ir_types.IntermediateRepresentation,
        generator_exec_wrapper: GeneratorExecWrapper,
        error: ir_types.ErrorDeclaration,
        project: Project,
    ) -> None:
        filepath = context.get_filepath_for_error(error.name)
        source_file = SourceFileFactory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        ErrorGenerator(context=context, error=error).generate(source_file=source_file)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def get_sorted_modules(self) -> None:
        return None

    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        return False
