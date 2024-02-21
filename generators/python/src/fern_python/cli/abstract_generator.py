from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Optional, Sequence, Tuple

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig
from fern.generator_exec.resources.config import (
    GeneratorPublishConfig,
    GithubOutputMode,
)

from fern_python.codegen.project import Project, ProjectConfig
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
        project_config = generator_config.output.mode.visit(
            download_files=lambda: None,
            publish=lambda publish: ProjectConfig(
                package_name=publish.registries_v_2.pypi.package_name,
                package_version=publish.version,
            ),
            github=lambda github_output_mode: self._get_github_publish_config(generator_config, github_output_mode),
        )
        with Project(
            filepath=generator_config.output.path,
            relative_path_to_project=os.path.join(
                *self.get_relative_path_to_project_for_publish(
                    generator_config=generator_config,
                    ir=ir,
                )
            )
            if project_config is not None
            else generator_config.organization,
            project_config=project_config,
            should_format_files=self.should_format_files(generator_config=generator_config),
            sorted_modules=self.get_sorted_modules(),
            flat_layout=self.is_flat_layout(generator_config=generator_config),
            whitelabel=generator_config.whitelabel,
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
            github=lambda _: self._poetry_install(
                generator_exec_wrapper=generator_exec_wrapper,
                generator_config=generator_config,
            ),
            publish=lambda publish_config: self._publish(
                generator_exec_wrapper=generator_exec_wrapper,
                publish_config=publish_config,
                generator_config=generator_config,
            ),
        )

    def _get_github_publish_config(
        self, generator_config: GeneratorConfig, output_mode: GithubOutputMode
    ) -> ProjectConfig:
        # when publishing to github, we always need a project config, so that
        # we generate a pyproject.toml
        if output_mode.publish_info is None:
            return ProjectConfig(
                package_name=generator_config.organization,
                package_version="0.0.0",
            )
        publish_info_union = output_mode.publish_info.get_as_union()
        if publish_info_union.type != "pypi":
            raise RuntimeError("Github publish info is not pypi")
        return ProjectConfig(
            package_name=publish_info_union.package_name,
            package_version=output_mode.version,
        )

    def _poetry_install(
        self, *, generator_exec_wrapper: GeneratorExecWrapper, generator_config: GeneratorConfig
    ) -> None:
        publisher = Publisher(
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )
        publisher.run_poetry_install()

    def _publish(
        self,
        generator_exec_wrapper: GeneratorExecWrapper,
        publish_config: GeneratorPublishConfig,
        generator_config: GeneratorConfig,
    ) -> None:
        publisher = Publisher(
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )
        publisher.publish_package(publish_config=publish_config)

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
        project.add_file("tests/__init__.py", "")
        project.add_file("tests/test_client.py", self._get_client_test())

    def _get_github_workflow(self, output_mode: GithubOutputMode) -> str:
        workflow_yaml = """name: ci

on: [push]
jobs:
  compile:
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Bootstrap poetry
        run: |
          curl -sSL https://install.python-poetry.org | python - -y --version 1.5.1
      - name: Install dependencies
        run: poetry install
      - name: Compile
        run: poetry run mypy .
  test:
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Bootstrap poetry
        run: |
          curl -sSL https://install.python-poetry.org | python - -y --version 1.5.1
      - name: Install dependencies
        run: poetry install
      - name: Test
        run: poetry run pytest .
"""
        if output_mode.publish_info is not None:
            publish_info_union = output_mode.publish_info.get_as_union()
            if publish_info_union.type != "pypi":
                raise RuntimeError("Publish info is for " + publish_info_union.type)

            workflow_yaml += f"""
  publish:
    needs: [compile, test]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Bootstrap poetry
        run: |
          curl -sSL https://install.python-poetry.org | python - -y --version 1.5.1
      - name: Install dependencies
        run: poetry install
      - name: Publish to pypi
        run: |
          poetry config repositories.{AbstractGenerator._REMOTE_PYPI_REPO_NAME} {publish_info_union.registry_url}
          poetry --no-interaction -v publish --build --repository {AbstractGenerator._REMOTE_PYPI_REPO_NAME} --username "${publish_info_union.username_environment_variable}" --password "${publish_info_union.password_environment_variable}"
        env:
          {publish_info_union.username_environment_variable}: ${{{{ secrets.{publish_info_union.username_environment_variable} }}}}
          {publish_info_union.password_environment_variable}: ${{{{ secrets.{publish_info_union.password_environment_variable} }}}}
"""
        return workflow_yaml

    def _get_client_test(self) -> str:
        return """import pytest

# Get started with writing tests with pytest at https://docs.pytest.org
@pytest.mark.skip(reason="Unimplemented")
def test_client() -> None:
    assert True == True
"""

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

    @abstractmethod
    def get_relative_path_to_project_for_publish(
        self,
        *,
        generator_config: GeneratorConfig,
        ir: ir_types.IntermediateRepresentation,
    ) -> Tuple[str, ...]:
        ...

    @abstractmethod
    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        ...

    @abstractmethod
    def get_sorted_modules(self) -> Optional[Sequence[str]]:
        ...
