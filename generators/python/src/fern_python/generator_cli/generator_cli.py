import os
import subprocess
import tempfile
from typing import Dict, List, Optional

import fern.generator_exec.resources as generator_exec
import fern.ir.resources as ir_types
import generatorcli
import yaml  # type: ignore

from fern_python.codegen import ProjectConfig
from fern_python.generator_cli.readme_snippet_builder import ReadmeSnippetBuilder
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

README_FILENAME = "README.md"
GENERATOR_CLI = "generator-cli"
GENERATOR_CLI_NPM_PACKAGE = "@fern-api/generator-cli"
DOCKER_FEATURES_CONFIG_PATH = "/assets/features.yml"
TEST_ENV = "PYTEST_CURRENT_TEST"


class GeneratorCli:
    def __init__(
        self,
        organization: str,
        project_config: Optional[ProjectConfig],
        ir: ir_types.IntermediateRepresentation,
        generator_exec_wrapper: GeneratorExecWrapper,
        skip_install: bool = False,
    ):
        self._organization = organization
        self._package_name = project_config.package_name if project_config is not None else organization
        self._ir = ir
        self._generator_exec_wrapper = generator_exec_wrapper

        if not skip_install:
            self._install()

    def generate_readme(
        self,
        snippets: generator_exec.Snippets,
        github_repo_url: Optional[str] = None,
        github_installation_token: Optional[str] = None,
    ) -> str:
        readme_snippet_builder = ReadmeSnippetBuilder(
            ir=self._ir,
            package_name=self._package_name,
            snippets=snippets,
        )
        readme_config_filepath = self._write_readme_config(
            snippets=readme_snippet_builder.build_readme_snippets(),
            github_repo_url=github_repo_url,
            github_installation_token=github_installation_token,
        )
        return self._run_command(
            command=[
                GENERATOR_CLI,
                "generate",
                "readme",
                "--config",
                readme_config_filepath,
            ]
        )

    def _install(self) -> None:
        self._run_command(command=["npm", "install", "-f", "-g", GENERATOR_CLI_NPM_PACKAGE])
        version = self._run_command([GENERATOR_CLI, "--version"])
        self._debug_log(message=f"Successfully installed {GENERATOR_CLI_NPM_PACKAGE} version {version}")
        self._installed = True

    def _write_readme_config(
        self,
        snippets: Dict[generatorcli.feature.FeatureId, List[str]],
        github_repo_url: Optional[str] = None,
        github_installation_token: Optional[str] = None,
    ) -> str:
        readme_config = self._get_readme_config(
            snippets=snippets,
            github_repo_url=github_repo_url,
            github_installation_token=github_installation_token,
        )
        file = tempfile.NamedTemporaryFile(delete=False, mode="w+")
        file.write(readme_config.json())
        file.flush()
        return file.name

    def _get_readme_config(
        self,
        snippets: Dict[generatorcli.feature.FeatureId, List[str]],
        github_repo_url: Optional[str] = None,
        github_installation_token: Optional[str] = None,
    ) -> generatorcli.readme.ReadmeConfig:
        feature_config = self._read_feature_config()
        features: List[generatorcli.readme.ReadmeFeature] = []
        for feature in feature_config.features:
            if feature.id not in snippets:
                continue
            feature_snippets = snippets[feature.id]
            features.append(
                generatorcli.readme.ReadmeFeature(
                    id=feature.id,
                    description=feature.description,
                    snippets=feature_snippets,
                    snippets_are_optional=False,
                ),
            )
        return generatorcli.readme.ReadmeConfig(
            organization=self._organization,
            language=self._get_language_info(),
            remote=self._get_remote(
                github_repo_url=github_repo_url,
                github_installation_token=github_installation_token,
            ),
            api_reference_link=self._ir.readme_config.api_reference_link if self._ir.readme_config else None,
            banner_link=self._ir.readme_config.banner_link if self._ir.readme_config else None,
            features=features,
        )

    def _read_feature_config(self) -> generatorcli.feature.FeatureConfig:
        with open(self._get_feature_config_filepath(), "r") as file:
            data = yaml.safe_load(file)
            return generatorcli.feature.FeatureConfig(**data)

    def _get_remote(
        self,
        github_repo_url: Optional[str] = None,
        github_installation_token: Optional[str] = None,
    ) -> Optional[generatorcli.readme.Remote]:
        if github_repo_url is not None and github_installation_token is not None:
            return generatorcli.readme.Remote.factory.github(
                generatorcli.readme.GithubRemote(
                    repo_url=github_repo_url,
                    installation_token=github_installation_token,
                ),
            )
        return None

    def _get_language_info(self) -> generatorcli.readme.LanguageInfo:
        return generatorcli.readme.LanguageInfo.factory.python(
            generatorcli.readme.PythonInfo(
                publish_info=generatorcli.readme.PypiPublishInfo(package_name=self._package_name)
            )
        )

    def _get_feature_config_filepath(self) -> str:
        if TEST_ENV in os.environ:
            return os.path.join(os.path.dirname(__file__), "../../sdk/features.yml")
        return DOCKER_FEATURES_CONFIG_PATH

    def _run_command(
        self,
        command: List[str],
    ) -> str:
        safe_command = " ".join(command)
        try:
            self._debug_log(message=safe_command)
            completed_command = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
            return completed_command.stdout.decode("utf-8")
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to run '{safe_command}': ", e)

    def _debug_log(self, message: str) -> None:
        self._generator_exec_wrapper.send_update(
            generator_exec.logging.GeneratorUpdate.factory.log(
                generator_exec.logging.LogUpdate(
                    level=generator_exec.logging.LogLevel.DEBUG,
                    message=message,
                )
            )
        )
