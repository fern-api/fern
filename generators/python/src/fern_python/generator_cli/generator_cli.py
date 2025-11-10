import json
import os
import subprocess
import tempfile
from typing import Dict, List, Optional, Union

import generatorcli
import yaml  # type: ignore
from fern_python.codegen import ProjectConfig
from fern_python.codegen.project import Project
from fern_python.generator_cli.readme_snippet_builder import ReadmeSnippetBuilder
from fern_python.generator_cli.reference_config_builder import ReferenceConfigBuilder
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadataCollector,
)
from fern_python.generators.sdk.client_generator.generated_root_client import (
    GeneratedRootClient,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.custom_config import SDKCustomConfig

import fern.generator_exec as generator_exec
import fern.ir.resources as ir_types

README_FILENAME = "README.md"
REFERENCE_FILENAME = "reference.md"
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
        context: SdkGeneratorContext,
        endpoint_metadata: EndpointMetadataCollector,
        skip_install: bool = False,
    ):
        self._organization = organization
        self._package_name = project_config.package_name if project_config is not None else organization
        self._ir = ir
        self._generator_exec_wrapper = generator_exec_wrapper
        self._context = context
        self._endpoint_metadata = endpoint_metadata

        if not skip_install:
            self._install()

    def _should_write_reference(self, reference_config: generatorcli.ReferenceConfig) -> bool:
        if len(reference_config.sections) == 0 and (
            reference_config.root_section is None or len(reference_config.root_section.endpoints) == 0
        ):
            self._generator_exec_wrapper.send_update(
                generator_exec.logging.GeneratorUpdate.factory.log(
                    generator_exec.logging.LogUpdate(
                        level=generator_exec.logging.LogLevel.DEBUG,
                        message="No sections found for reference.md, skipping generation. This is OK.",
                    )
                )
            )
            return False
        return True

    def generate_reference(self, snippets: generator_exec.Snippets, project: Project) -> Optional[str]:
        reference_config_builder = ReferenceConfigBuilder(
            ir=self._ir,
            snippets=snippets,
            endpoint_metadata=self._endpoint_metadata,
            context=self._context,
            project=project,
        )

        reference_config = reference_config_builder.generate_reference_config()
        if self._should_write_reference(reference_config):
            reference_config_filepath = self._write_reference_config(reference_config=reference_config)
            print(
                f"running command: {' '.join([GENERATOR_CLI, 'generate-reference', '--config', reference_config_filepath])}"
            )
            return self._run_command(
                command=[GENERATOR_CLI, "generate-reference", "--config", reference_config_filepath]
            )

        return None

    def generate_readme(
        self,
        snippets: generator_exec.Snippets,
        generated_root_client: GeneratedRootClient,
        github_repo_url: Optional[str] = None,
        github_installation_token: Optional[str] = None,
        pagination_enabled: Union[bool, None] = False,
        websocket_enabled: bool = False,
    ) -> str:
        readme_snippet_builder = ReadmeSnippetBuilder(
            ir=self._ir,
            package_name=self._package_name,
            snippets=snippets,
            pagination_enabled=pagination_enabled,
            websocket_enabled=websocket_enabled,
            generated_root_client=generated_root_client,
            api_error_reference=self._context.core_utilities.get_reference_to_api_error(as_snippet=True),
            endpoint_metadata=self._endpoint_metadata,
            source_file_factory=self._context.source_file_factory,
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
        try:
            self._run_command(command=["npm", "install", "-f", "-g", GENERATOR_CLI_NPM_PACKAGE])
        except Exception as e:
            self._debug_log(message=f"Failed to install {GENERATOR_CLI_NPM_PACKAGE} due to error: {e}")

        try:
            version = self._run_command([GENERATOR_CLI, "--version"])
        except Exception as e:
            _err_msg = f"Failed to get version of {GENERATOR_CLI_NPM_PACKAGE} due to error: {e}"
            self._debug_log(message=_err_msg)
            raise Exception(_err_msg)

        self._debug_log(message=f"Successfully installed {GENERATOR_CLI_NPM_PACKAGE} version {version}")
        self._installed = True

    def _write_reference_config(
        self,
        reference_config: generatorcli.reference.ReferenceConfig,
    ) -> str:
        file = tempfile.NamedTemporaryFile(delete=False, mode="w+")
        file.write(json.dumps(reference_config.dict()))
        file.flush()
        return file.name

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
        print(f"readme_config: {json.dumps(readme_config.dict(), indent=2)}")
        file = tempfile.NamedTemporaryFile(delete=False, mode="w+")
        file.write(json.dumps(readme_config.dict()))
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
                    advanced=feature.advanced,
                    description=feature.description,
                    snippets=feature_snippets,
                    snippets_are_optional=False,
                ),
            )
        return generatorcli.readme.ReadmeConfig(
            introduction=self._ir.readme_config.introduction if self._ir.readme_config else None,
            organization=self._organization,
            language=self._get_language_info(),
            remote=self._get_remote(
                github_repo_url=github_repo_url,
                github_installation_token=github_installation_token,
            ),
            api_reference_link=self._ir.readme_config.api_reference_link if self._ir.readme_config else None,
            banner_link=self._ir.readme_config.banner_link if self._ir.readme_config else None,
            features=features,
            reference_markdown_path=f"./{REFERENCE_FILENAME}",
            api_name=self._ir.readme_config.api_name if self._ir.readme_config else None,
            disabled_features=self._ir.readme_config.disabled_features if self._ir.readme_config else None,
            white_label=self._ir.readme_config.white_label if self._ir.readme_config else None,
            custom_sections=self._get_custom_readme_sections(),
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
        print(f"github_repo_url: {github_repo_url}")
        print(f"github_installation_token: {github_installation_token}")
        if github_repo_url is not None and github_installation_token is not None:
            return generatorcli.readme.Remote(
                type="github",
                repo_url=github_repo_url,
                installation_token=github_installation_token,
            )
        return None

    def _get_language_info(self) -> generatorcli.readme.LanguageInfo:
        return generatorcli.readme.LanguageInfo_Python(
            publish_info=generatorcli.readme.PypiPublishInfo(package_name=self._package_name),
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

    def _get_custom_readme_sections(self) -> Optional[List[generatorcli.CustomSection]]:
        ir_custom_sections = self._ir.readme_config.custom_sections if self._ir.readme_config else None
        custom_config_sections = SDKCustomConfig.parse_obj(
            self._context.generator_config.custom_config or {}
        ).custom_readme_sections

        self._debug_log(message=f"IR custom sections: {ir_custom_sections}")
        self._debug_log(message=f"Custom config sections: {custom_config_sections}")

        sections = []
        for ir_section in ir_custom_sections or []:
            if ir_section.language == "python" and not any(
                s.title == ir_section.title for s in custom_config_sections or []
            ):
                sections.append(
                    generatorcli.CustomSection(name=ir_section.title, language="PYTHON", content=ir_section.content)
                )

        for config_section in custom_config_sections or []:
            sections.append(
                generatorcli.CustomSection(name=config_section.title, language="PYTHON", content=config_section.content)
            )

        return sections if len(sections) > 0 else None
