from __future__ import annotations

from abc import ABC, abstractmethod

import fern.ir_v1.pydantic as ir_types
from generator_exec.resources import GeneratorConfig
from generator_exec.resources.config import GeneratorPublishConfig

from fern_python.codegen.project import Project, PublishConfig
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

from .publisher import Publisher


class AbstractGenerator(ABC):
    def generate_project(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ) -> None:
        project_publish_config = generator_config.output.mode.visit(
            download_files=lambda: None,
            publish=lambda publish: PublishConfig(
                package_name=publish.registries_v_2.pypi.package_name, package_version=publish.version
            ),
        )
        with Project(
            filepath=generator_config.output.path,
            project_name=generator_config.organization,
            publish_config=project_publish_config,
        ) as project:
            self.run(
                generator_exec_wrapper=generator_exec_wrapper, ir=ir, generator_config=generator_config, project=project
            )
        generator_config.output.mode.visit(
            download_files=lambda: None,
            publish=lambda publish_config: self._publish(
                generator_exec_wrapper=generator_exec_wrapper,
                publish_config=publish_config,
                generator_config=generator_config,
            ),
        )

    def _publish(
        self,
        generator_exec_wrapper: GeneratorExecWrapper,
        publish_config: GeneratorPublishConfig,
        generator_config: GeneratorConfig,
    ) -> None:
        publisher = Publisher(
            generator_exec_wrapper=generator_exec_wrapper,
            publish_config=publish_config,
            generator_config=generator_config,
        )
        publisher.publish_project()

    @abstractmethod
    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        ...
