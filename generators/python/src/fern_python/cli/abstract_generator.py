from __future__ import annotations

import os
import re
from abc import ABC, abstractmethod
from typing import Literal, Optional, Sequence, Tuple, cast

import fern.ir.resources as ir_types
from fern.generator_exec import GeneratorConfig, PypiMetadata
from fern.generator_exec.config import (
    GeneratorPublishConfig,
    GithubOutputMode,
    OutputMode,
    PypiGithubPublishInfo,
)

from fern_python.codegen.project import Project, ProjectConfig
from fern_python.external_dependencies.ruff import RUFF_DEPENDENCY
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
        maybe_github_output_mode = generator_config.output.mode.visit(
            download_files=lambda: None,
            publish=lambda _: None,
            github=lambda github_output_mode: github_output_mode,
        )
        python_version = "^3.8"
        if generator_config.custom_config is not None and "pyproject_python_version" in generator_config.custom_config:
            python_version = generator_config.custom_config.get("pyproject_python_version")

        user_defined_toml = None
        if generator_config.custom_config is not None and "pyproject_toml" in generator_config.custom_config:
            user_defined_toml = generator_config.custom_config.get("pyproject_toml")
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
            sorted_modules=self.get_sorted_modules(),
            flat_layout=self.is_flat_layout(generator_config=generator_config),
            whitelabel=generator_config.whitelabel,
            python_version=python_version,
            pypi_metadata=self._get_pypi_metadata(generator_config=generator_config),
            github_output_mode=maybe_github_output_mode,
            license_=generator_config.license,
            user_defined_toml=user_defined_toml,
        ) as project:
            self.run(
                generator_exec_wrapper=generator_exec_wrapper,
                ir=ir,
                generator_config=generator_config,
                project=project,
            )

            project.add_dev_dependency(dependency=RUFF_DEPENDENCY)

            generator_config.output.mode.visit(
                download_files=lambda: None,
                github=lambda github_output_mode: self._write_files_for_github_repo(
                    project=project,
                    output_mode=github_output_mode,
                    write_unit_tests=(self.project_type() == "sdk" and generator_config.write_unit_tests),
                ),
                publish=lambda x: None,
            )

        publisher = Publisher(
            should_format=self.should_format_files(generator_config=generator_config),
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )

        output_mode: OutputMode = generator_config.output.mode
        output_mode_union = output_mode.get_as_union()

        if output_mode_union.type == "downloadFiles":
            # since download files does not contain a pyproject.toml
            # we run ruff using the fern_python poetry.toml (copied into the docker)
            try:
                publisher._run_command(
                    command=["poetry", "run", "ruff", "format", "/fern/output"],
                    safe_command="poetry run ruff format /fern/output",
                    cwd="/",
                )
            except:
                pass
        elif output_mode_union.type == "github":
            publisher.run_poetry_install()
            publisher.run_ruff_format()
        elif output_mode_union.type == "publish":
            publisher.run_poetry_install()
            publisher.run_ruff_format()
            publisher.publish_package(publish_config=output_mode_union)

    # We're trying not to change the casing more than we need to, so here
    # we're using the same casing as is given but just removing `-` and other special characters as
    # python does not allow `-` in package names. Note pypi should be fine with it
    def _clean_organization_name(self, organization: str) -> str:
        # Replace non-alphanumeric characters with underscores
        return re.sub("[^a-zA-Z0-9]", "_", organization)

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

    def _get_pypi_metadata(self, generator_config: GeneratorConfig) -> Optional[PypiMetadata]:
        return generator_config.output.mode.visit(
            download_files=lambda: None,
            publish=lambda publish: publish.registries_v_2.pypi.pypi_metadata,
            github=lambda github: cast(PypiGithubPublishInfo, github.publish_info.get_as_union()).pypi_metadata
            if github.publish_info is not None and github.publish_info.get_as_union().type == "pypi"
            else None,
        )

    def _poetry_install_and_format(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        generator_config: GeneratorConfig,
    ) -> None:
        publisher = Publisher(
            should_format=self.should_format_files(generator_config=generator_config),
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )
        publisher.run_poetry_install()
        publisher.run_ruff_format()

    def _publish(
        self,
        generator_exec_wrapper: GeneratorExecWrapper,
        publish_config: GeneratorPublishConfig,
        generator_config: GeneratorConfig,
    ) -> None:
        publisher = Publisher(
            should_format=self.should_format_files(generator_config=generator_config),
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )
        publisher.publish_package(publish_config=publish_config)

    def _write_files_for_github_repo(
        self, project: Project, output_mode: GithubOutputMode, write_unit_tests: bool
    ) -> None:
        project.add_file(
            ".gitignore",
            """dist/
.mypy_cache/
__pycache__/
poetry.toml
.ruff_cache/
""",
        )
        project.add_file(
            ".github/workflows/ci.yml",
            self._get_github_workflow(output_mode, write_unit_tests),
        )
        project.add_file("tests/custom/test_client.py", self._get_client_test())

    def _get_github_workflow(self, output_mode: GithubOutputMode, write_unit_tests: bool) -> str:
        workflow_yaml = f"""name: ci

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
"""
        if write_unit_tests:
            workflow_yaml += """
      - name: Install Fern
        run: npm install -g fern-api
      - name: Test
        run: fern test --command "poetry run pytest -rP ."
"""
        else:
            workflow_yaml += """
      - name: Test
        run: poetry run pytest -rP .
"""
        if output_mode.publish_info is not None:
            publish_info_union = output_mode.publish_info.get_as_union()
            if publish_info_union.type != "pypi":
                raise RuntimeError("Publish info is for " + publish_info_union.type)
            # First condition is for resilience in the event that Fiddle isn't upgraded to include the new flag
            if (
                publish_info_union.should_generate_publish_workflow is None
                or publish_info_union.should_generate_publish_workflow
            ):
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
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]:
        ...

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
