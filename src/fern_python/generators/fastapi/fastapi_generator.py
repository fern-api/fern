import fern.ir.pydantic as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model import (
    PydanticModelCustomConfig,
    PydanticModelGenerator,
)
from fern_python.source_file_generator import SourceFileGenerator

from .auth import SecurityFileGenerator
from .context import FastApiGeneratorContext, FastApiGeneratorContextImpl
from .custom_config import FastAPICustomConfig
from .error_generator import ErrorGenerator
from .fern_http_exception import FernHTTPExceptionGenerator
from .inlined_request_generator import InlinedRequestGenerator
from .register import RegisterFileGenerator
from .service_generator import ServiceGenerator


class FastApiGenerator(AbstractGenerator):
    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = FastAPICustomConfig.parse_obj(generator_config.custom_config or {})
        return custom_config.skip_formatting is None or not custom_config.skip_formatting

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
            forbid_extra_fields=True,
            wrapped_aliases=True,
            include_validators=custom_config.include_validators,
            skip_formatting=custom_config.skip_formatting,
        )

        context = FastApiGeneratorContextImpl(ir=ir, generator_config=generator_config)

        PydanticModelGenerator().generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            custom_config=self._pydantic_model_custom_config,
            ir=ir,
            project=project,
            context=context.pydantic_generator_context,
        )

        for service in ir.services:
            self._generate_service(
                context=context,
                ir=ir,
                generator_exec_wrapper=generator_exec_wrapper,
                service=service,
                project=project,
            )

        for error in ir.errors:
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

        FernHTTPExceptionGenerator(context=context).generate(
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
        with SourceFileGenerator.generate(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        ) as source_file:
            ServiceGenerator(context=context, service=service).generate(source_file=source_file)

        for endpoint in service.endpoints:
            if endpoint.request_body is not None:
                request_body = endpoint.request_body.get_as_union()
                if request_body.type == "inlinedRequestBody":
                    with SourceFileGenerator.generate(
                        project=project,
                        filepath=context.get_filepath_for_inlined_request(
                            service_name=service.name, request=request_body
                        ),
                        generator_exec_wrapper=generator_exec_wrapper,
                    ) as source_file:
                        InlinedRequestGenerator(
                            context=context,
                            request=request_body,
                            pydantic_model_custom_config=self._pydantic_model_custom_config,
                        ).generate(
                            source_file=source_file,
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
        with SourceFileGenerator.generate(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        ) as source_file:
            ErrorGenerator(context=context, error=error).generate(source_file=source_file)
