import subprocess
from typing import List

from generator_exec.resources import logging
from generator_exec.resources.config import GeneratorConfig, GeneratorPublishConfig

from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class Publisher:

    _poetry_repo_name: str = "fern"

    def __init__(
        self,
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
                f"repositories.{self._poetry_repo_name}",
                pypi_registry_config.registry_url,
            ],
            safe_command="poetry config repositories.fern <url>",
        )
        self._run_command(
            command=[
                "poetry",
                "config",
                f"http-basic.{self._poetry_repo_name}",
                pypi_registry_config.username,
                pypi_registry_config.password,
            ],
            safe_command="poetry config http-basic.fern <creds>",
        )
        self._run_command(
            command=[
                "poetry",
                "publish",
                "--build",
                "--repository",
                self._poetry_repo_name,
            ],
            safe_command="poetry publish",
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
