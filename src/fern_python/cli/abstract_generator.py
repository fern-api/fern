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
    _REMOTE_PYPI_REPO_NAME = "remote"

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
                github=lambda github_output_mode: self._write_files_for_github_repo(
                    project=project, output_mode=github_output_mode
                ),
                publish=lambda x: None,
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

    def _write_files_for_github_repo(self, project: Project, output_mode: GithubOutputMode) -> None:
        project.add_file(
            ".gitignore",
            """dist/
.mypy_cache/
__pycache__/
poetry.toml
""",
        )
        project.add_file(".github/workflows/ci.yml", self._get_github_workflow(output_mode))

    def _get_github_workflow(self, output_mode: GithubOutputMode) -> str:
        workflow_yaml = """name: ci

on: [push]
jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.7
      - name: Install dependencies
        run: poetry install
      - name: Compile
        run: poetry run mypy .

  publish:
    needs: [ compile ]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.7
      - name: Install dependencies
        run: poetry install"""

        if output_mode.publish_info is not None:
            publish_info_union = output_mode.publish_info.get_as_union()
            if publish_info_union.type != "pypi":
                raise RuntimeError("Publish info is for " + publish_info_union.type)

            workflow_yaml += f"""
      - name: Publish to pypi
        run: |
          poetry config repositories.{AbstractGenerator._REMOTE_PYPI_REPO_NAME} {publish_info_union.registry_url}
          poetry --no-interaction -v publish --build --repository {AbstractGenerator._REMOTE_PYPI_REPO_NAME} --username "${publish_info_union.username_environment_variable}" --password "${publish_info_union.password_environment_variable}"
        env:
          {publish_info_union.username_environment_variable}: ${{{{ secrets.{publish_info_union.username_environment_variable} }}}}
          {publish_info_union.password_environment_variable}: ${{{{ secrets.{publish_info_union.password_environment_variable} }}}}"""

        return workflow_yaml

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
