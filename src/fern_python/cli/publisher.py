import subprocess
from typing import List

from fern.generator_exec.sdk.resources import logging
from fern.generator_exec.sdk.resources.config import (
    GeneratorConfig,
    GeneratorPublishConfig,
)

from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class Publisher:

    _REMOTE_PYPI_REPO_NAME: str = "remote"

    def __init__(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        publish_config: GeneratorPublishConfig,
        generator_config: GeneratorConfig,
    ):
        self._generator_exec_wrapper = generator_exec_wrapper
        self._publish_config = publish_config
        self._generator_config = generator_config

    def publish_project(
        self,
    ) -> None:
        pypi_registry_config = self._publish_config.registries_v_2.pypi
        self._run_command(
            command=["poetry", "install"],
            safe_command="poetry install",
        )
        self._run_command(
            command=[
                "poetry",
                "config",
                f"repositories.{Publisher._REMOTE_PYPI_REPO_NAME}",
                pypi_registry_config.registry_url,
            ],
            safe_command=f"poetry config repositories.{Publisher._REMOTE_PYPI_REPO_NAME} <url>",
        )
        self._run_command(
            command=[
                "poetry",
                "config",
                f"http-basic.{self._REMOTE_PYPI_REPO_NAME}",
                pypi_registry_config.username,
                pypi_registry_config.password,
            ],
            safe_command=f"poetry config http-basic.{Publisher._REMOTE_PYPI_REPO_NAME} <creds>",
        )

        publish_command = [
            "poetry",
            "publish",
            "--build",
            "--repository",
            Publisher._REMOTE_PYPI_REPO_NAME,
        ]
        if self._generator_config.dry_run:
            publish_command.append("--dry-run")
        self._run_command(
            command=publish_command,
            safe_command=" ".join(publish_command),
        )

    def _run_command(
        self,
        *,
        command: List[str],
        safe_command: str,
    ) -> None:
        try:
            self._generator_exec_wrapper.send_update(
                logging.GeneratorUpdate.factory.log(
                    logging.LogUpdate(level=logging.LogLevel.DEBUG, message=safe_command)
                )
            )
            completed_command = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self._generator_config.output.path,
                check=True,
            )
            print(f"Ran command: {' '.join(command)}")
            print(completed_command.stdout)
            print(completed_command.stderr)
        except subprocess.CalledProcessError as e:
            print(f"Failed to run command: {' '.join(command)}")
            print(e.stdout)
            print(e.stderr)
            raise Exception("Failed to run command", safe_command)
