from __future__ import annotations

import os
import re
import textwrap
from abc import ABC, abstractmethod
from typing import Literal, Optional, Sequence, Tuple, cast

from .publisher import Publisher
from fern_python.codegen.project import Project, ProjectConfig
from fern_python.external_dependencies.ruff import RUFF_DEPENDENCY
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

import fern.ir.resources as ir_types
from fern.generator_exec import (
    GeneratorConfig,
    PypiMetadata,
)
from fern.generator_exec.config import (
    GeneratorPublishConfig,
    GithubOutputMode,
    OutputMode,
    PypiGithubPublishInfo,
)


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
        if ir.publish_config is not None:
            ir_publish_config = ir.publish_config.get_as_union()
            if ir_publish_config.type == "filesystem" and ir_publish_config.generate_full_project:
                package_version = "0.0.0"
                package_name = "default_package_name"
                if ir_publish_config.publish_target is not None:
                    publish_target = ir_publish_config.publish_target.get_as_union()
                    if publish_target.type == "pypi":
                        if publish_target.version is not None:
                            package_version = publish_target.version
                        if publish_target.package_name is not None:
                            package_name = publish_target.package_name

                project_config = ProjectConfig(package_name=package_name, package_version=package_version)
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

        exclude_types_from_init_exports = False
        if (
            generator_config.custom_config is not None
            and "exclude_types_from_init_exports" in generator_config.custom_config
        ):
            exclude_types_from_init_exports = generator_config.custom_config.get("exclude_types_from_init_exports")

        recursion_limit = None
        if generator_config.custom_config is not None and "recursion_limit" in generator_config.custom_config:
            recursion_limit = generator_config.custom_config.get("recursion_limit")

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
            exclude_types_from_init_exports=exclude_types_from_init_exports,
            lazy_imports=self.should_use_lazy_imports(generator_config=generator_config),
            recursion_limit=recursion_limit,
        ) as project:
            self.run(
                generator_exec_wrapper=generator_exec_wrapper,
                ir=ir,
                generator_config=generator_config,
                project=project,
            )

            project.add_dev_dependency(dependency=RUFF_DEPENDENCY)

            include_legacy_wire_tests = (
                generator_config.custom_config is not None
                and generator_config.custom_config.get("include_legacy_wire_tests", False)
            )

            generator_config.output.mode.visit(
                download_files=lambda: None,
                github=lambda github_output_mode: self._write_files_for_github_repo(
                    project=project,
                    output_mode=github_output_mode,
                    publish_config=generator_config.publish,
                    write_unit_tests=(
                        self.project_type() == "sdk" and include_legacy_wire_tests and generator_config.write_unit_tests
                    ),
                ),
                publish=lambda x: None,
            )

        publisher = Publisher(
            should_fix=self.should_fix_files(),
            should_format=self.should_format_files(generator_config=generator_config),
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )

        output_mode: OutputMode = generator_config.output.mode
        output_mode_union = output_mode.get_as_union()

        if output_mode_union.type == "downloadFiles":
            # since download files does not contain a pyproject.toml
            # we run ruff using the fern_python pyproject.toml (copied into the docker)
            publisher.run_ruff_check_fix("/fern/output", cwd="/")
            publisher.run_ruff_format("/fern/output", cwd="/")
        elif output_mode_union.type == "github":
            publisher.run_uv_sync()
            publisher.run_ruff_check_fix()
            publisher.run_ruff_format()
        elif output_mode_union.type == "publish":
            publisher.run_uv_sync()
            publisher.run_ruff_check_fix()
            publisher.run_ruff_format()
            publisher.publish_package(publish_config=output_mode_union)

        self.postrun(
            generator_exec_wrapper=generator_exec_wrapper,
        )

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

    def _publish(
        self,
        generator_exec_wrapper: GeneratorExecWrapper,
        publish_config: GeneratorPublishConfig,
        generator_config: GeneratorConfig,
    ) -> None:
        publisher = Publisher(
            should_fix=self.should_fix_files(),
            should_format=self.should_format_files(generator_config=generator_config),
            generator_exec_wrapper=generator_exec_wrapper,
            generator_config=generator_config,
        )
        publisher.publish_package(publish_config=publish_config)

    def _write_files_for_github_repo(
        self,
        project: Project,
        output_mode: GithubOutputMode,
        write_unit_tests: bool,
        publish_config: GeneratorPublishConfig | None,
    ) -> None:
        import logging

        logger = logging.getLogger("fern_python.cli.abstract_generator._write_files_for_github_repo")
        logger.debug("Starting to write files for GitHub repository...")

        logger.debug("Adding .gitignore file to project.")
        project.add_file(
            ".gitignore",
            textwrap.dedent(
                """\
                .mypy_cache/
                .ruff_cache/
                __pycache__/
                dist/
                .venv/
                """
            ),
        )
        # INSERT_YOUR_CODE
        logger.debug(f"Full publish_config: {publish_config!r}")

        use_oidc_workflow = False
        logger.debug("Checking publish_config for OIDC workflow selection.")
        if publish_config is not None:
            logger.debug("publish_config is present.")
            if publish_config.registries_v_2 is not None:
                logger.debug("publish_config.registries_v_2 is not None.")
                if publish_config.registries_v_2.pypi is not None:
                    logger.debug("publish_config.registries_v_2.pypi is not None.")
                    logger.debug(
                        f"publish_config.registries_v_2.pypi.password: {publish_config.registries_v_2.pypi.password!r}"
                    )
                    use_oidc_workflow = publish_config.registries_v_2.pypi.password == "OIDC"
                    if use_oidc_workflow:
                        logger.info("OIDC workflow selected for GitHub CI configuration.")
                    else:
                        logger.info("Legacy workflow selected for GitHub CI configuration (non-OIDC).")
                else:
                    logger.warning("publish_config.registries_v_2.pypi is None; not using OIDC workflow.")
            else:
                logger.warning("publish_config.registries_v_2 is None; not using OIDC workflow.")
        else:
            logger.info("publish_config is None; not using OIDC workflow.")

        # Add the CI workflow with logs for which workflow logic is selected.
        workflow_path = ".github/workflows/ci.yml"
        logger.debug(f"Adding workflow file: {workflow_path} (use_oidc_workflow={use_oidc_workflow})")
        if use_oidc_workflow:
            workflow_content = self._get_github_workflow(output_mode, write_unit_tests)
            logger.debug(f"CI workflow content from _get_github_workflow (OIDC):\n{workflow_content}")
        else:
            workflow_content = self._get_github_workflow_legacy(output_mode, write_unit_tests)
            logger.debug(f"CI workflow content from _get_github_workflow_legacy (legacy):\n{workflow_content}")

        project.add_file(
            workflow_path,
            workflow_content,
        )

        # Always write the client test, with logging of intent
        logger.debug("Adding test file: tests/custom/test_client.py")
        client_test_content = self._get_client_test()
        logger.debug(f"Client test file contents:\n{client_test_content}")
        project.add_file("tests/custom/test_client.py", client_test_content)
        logger.debug("Finished writing files for GitHub repository.")

    def _get_github_workflow_legacy(self, output_mode: GithubOutputMode, write_unit_tests: bool) -> str:
        workflow_yaml = """name: ci
on: [push]
jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Install uv
        run: pip install uv
      - name: Install dependencies
        run: uv sync
      - name: Compile
        run: uv run mypy .
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Install uv
        run: pip install uv
      - name: Install dependencies
        run: uv sync
"""
        if write_unit_tests:
            workflow_yaml += """
      - name: Install Fern
        run: npm install -g fern-api
      - name: Test
        run: fern test --command "uv run pytest -rP ."
"""
        else:
            workflow_yaml += """
      - name: Test
        run: uv run pytest -rP .
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
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Install uv
        run: pip install uv
      - name: Install dependencies
        run: uv sync
      - name: Publish to pypi
        run: |
          uv build
          uv publish --publish-url {publish_info_union.registry_url} --username "${publish_info_union.username_environment_variable}" --password "${publish_info_union.password_environment_variable}"
        env:
          {publish_info_union.username_environment_variable}: ${{{{ secrets.{publish_info_union.username_environment_variable} }}}}
          {publish_info_union.password_environment_variable}: ${{{{ secrets.{publish_info_union.password_environment_variable} }}}}
"""
        return workflow_yaml

    def _get_github_workflow(self, output_mode: GithubOutputMode, write_unit_tests: bool) -> str:
        # new workflow that supports automated OIDC-attestation signing and publishing to PyPI
        workflow_yaml = """name: ci

on: [push]
jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
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
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
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
                workflow_yaml += """
  build:
    name: Build distribution
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Set up python
        uses: actions/setup-python@v4
        with:
          python-version: 3.8
      - name: Bootstrap poetry
        run: |
          curl -sSL https://install.python-poetry.org | python - -y --version 1.5.1
      - name: Install dependencies
        run: poetry install
      - name: Build package
        run: poetry build
      - name: Store the distribution packages
        uses: actions/upload-artifact@v4
        with:
          name: python-package-distributions
          path: dist/
"""
                workflow_yaml += f"""
  publish:
    name: Publish to PyPI
    needs: [compile, test, build]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    environment:
      name: pypi
      url: https://pypi.org/p/${{{{ github.event.repository.name }}}}
    permissions:
      id-token: write
    steps:
      - name: Download all the dists
        uses: actions/download-artifact@v4
        with:
          name: python-package-distributions
          path: dist/
      - name: Publish to pypi with attestations
        uses: pypa/gh-action-pypi-publish@release/v1
        with:
          repository-url: {publish_info_union.registry_url}
"""
        return workflow_yaml

    def _get_client_test(self) -> str:
        return """import pytest

# Get started with writing tests with pytest at https://docs.pytest.org
@pytest.mark.skip(reason="Unimplemented")
def test_client() -> None:
    assert True
"""

    @abstractmethod
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]: ...

    @abstractmethod
    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None: ...

    @abstractmethod
    def postrun(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
    ) -> None: ...

    @abstractmethod
    def should_fix_files(self) -> bool: ...

    @abstractmethod
    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool: ...

    @abstractmethod
    def should_use_lazy_imports(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool: ...

    @abstractmethod
    def get_relative_path_to_project_for_publish(
        self,
        *,
        generator_config: GeneratorConfig,
        ir: ir_types.IntermediateRepresentation,
    ) -> Tuple[str, ...]: ...

    @abstractmethod
    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool: ...

    @abstractmethod
    def get_sorted_modules(self) -> Optional[Sequence[str]]: ...
