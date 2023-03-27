from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

import fern.ir.pydantic as ir_types
from fern.generator_exec.sdk.resources import GeneratorConfig
from fern.generator_exec.sdk.resources.config import (
    GeneratorPublishConfig,
    GithubOutputMode,
)

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
            github=self._get_github_publish_config,
        )
        with Project(
            filepath=generator_config.output.path,
            project_name=generator_config.organization,
            publish_config=project_publish_config,
            should_format_files=self.should_format_files(generator_config=generator_config),
        ) as project:
            self.run(
                generator_exec_wrapper=generator_exec_wrapper, ir=ir, generator_config=generator_config, project=project
            )
        generator_config.output.mode.visit(
            download_files=lambda: None,
            github=lambda x: None,
            publish=lambda publish_config: self._publish(
                generator_exec_wrapper=generator_exec_wrapper,
                publish_config=publish_config,
                generator_config=generator_config,
            ),
        )

    def _get_github_publish_config(self, output_mode: GithubOutputMode) -> Optional[PublishConfig]:
        if output_mode.publish_info is None:
            return None
        publish_info_union = output_mode.publish_info.get_as_union()
        if publish_info_union.type != "pypi":
            raise RuntimeError("Github publishi info is not pypi")
        return PublishConfig(
            package_name=publish_info_union.package_name,
            package_version=output_mode.version,
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

    @abstractmethod
    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        ...
