import os
import subprocess
import tempfile
from typing import Dict, List, Optional

from fern.generator_exec import logging
from fern.generator_exec.config import GeneratorConfig, GeneratorPublishConfig

from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class Publisher:
    _REMOTE_PYPI_REPO_NAME: str = "remote"

    def __init__(
        self,
        *,
        should_fix: bool,
        should_format: bool,
        generator_exec_wrapper: GeneratorExecWrapper,
        generator_config: GeneratorConfig,
    ):
        self._should_fix = should_fix
        self._should_format = should_format
        self._generator_exec_wrapper = generator_exec_wrapper
        self._generator_config = generator_config

    def _get_uv_env(self) -> Dict[str, str]:
        """Get environment with UV_PROJECT_ENVIRONMENT set to temp directory."""
        temp_venv = tempfile.mkdtemp(prefix="fern-uv-venv-")
        env = os.environ.copy()
        env["UV_PROJECT_ENVIRONMENT"] = temp_venv
        return env

    def run_ruff_check_fix(self, path: Optional[str] = None, *, cwd: Optional[str] = None) -> None:
        if self._should_fix:
            command = ["uv", "run", "ruff", "check", "--fix", "--no-cache", "--ignore", "E741"]
            if path is not None:
                command.append(path)
            self._run_command(
                command=command,
                safe_command=" ".join(command),
                cwd=cwd,
                env=self._get_uv_env() if cwd is None else None,  # only set for output directory commands
            )

    def run_ruff_format(self, path: Optional[str] = None, *, cwd: Optional[str] = None) -> None:
        if self._should_format:
            command = ["uv", "run", "ruff", "format", "--no-cache"]
            if path is not None:
                command.append(path)
            self._run_command(
                command=command,
                safe_command=" ".join(command),
                cwd=cwd,
                env=self._get_uv_env() if cwd is None else None,  # only set for output directory commands
            )

    def run_uv_sync(self) -> None:
        self._run_command(
            command=["uv", "sync"],
            safe_command="uv sync",
            env=self._get_uv_env(),
        )

    def publish_package(
        self,
        *,
        publish_config: GeneratorPublishConfig,
    ) -> None:
        pypi_registry_config = publish_config.registries_v_2.pypi

        # Build the package first
        self._run_command(
            command=["uv", "build"],
            safe_command="uv build",
        )

        # Publish using uv with environment variables for authentication
        publish_command = [
            "uv",
            "publish",
            "--publish-url",
            pypi_registry_config.registry_url,
            "--username",
            pypi_registry_config.username,
            "--password",
            pypi_registry_config.password,
        ]
        if not self._generator_config.dry_run:
            self._run_command(
                command=publish_command,
                safe_command="uv publish --publish-url <url> --username <username> --password <password>",
            )
        else:
            # uv doesn't have a dry-run flag, so we just skip the publish
            self._generator_exec_wrapper.send_update(
                logging.GeneratorUpdate.factory.log(
                    logging.LogUpdate(level=logging.LogLevel.INFO, message="Skipping publish (dry-run mode)")
                )
            )

    def _run_command(
        self,
        *,
        command: List[str],
        safe_command: str,
        cwd: Optional[str] = None,
        env: Optional[Dict[str, str]] = None,
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
                cwd=self._generator_config.output.path if cwd is None else cwd,
                check=True,
                env=env,
            )
            print(f"Ran command: {' '.join(command)}")
            print(completed_command.stdout)
            print(completed_command.stderr)
        except subprocess.CalledProcessError as e:
            self._generator_exec_wrapper.send_update(
                logging.GeneratorUpdate.factory.log(
                    logging.LogUpdate(
                        level=logging.LogLevel.ERROR,
                        message=f"Failed to run command: {safe_command}.\n{e.stdout}\n{e.stderr}",
                    )
                )
            )
            print(f"Failed to run command: {' '.join(command)}")
            print(e.stdout)
            print(e.stderr)
            raise Exception("Failed to run command", safe_command)
