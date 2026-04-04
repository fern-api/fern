import os
import subprocess
import sys
from pathlib import Path

from fern_python.generator_exec_wrapper import GeneratorExecWrapper

import fern.generator_exec as generator_exec

# v2BinPath is the path to the python-v2 binary included in the SDK
# generator docker image.
V2_BIN_PATH = "/bin/python-v2"


def _resolve_v2_bin_path() -> str:
    """Resolve the python-v2 binary path.

    In Docker the binary is at /bin/python-v2. In local mode it lives at
    generators/python-v2/sdk/dist/cli.cjs relative to the repo root.
    """
    if Path(V2_BIN_PATH).exists():
        return V2_BIN_PATH
    # Local mode: walk up from this file to find the repo-relative path
    local_path = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "../../../../../../python-v2/sdk/dist/cli.cjs")
    )
    if Path(local_path).exists():
        return local_path
    return V2_BIN_PATH


class PythonV2Generator:
    """Generator represents a shim used to run the python-v2 SDK generator."""

    def __init__(self, coordinator: GeneratorExecWrapper):
        self.coordinator = coordinator

    def run(self) -> None:
        if len(sys.argv) < 2:
            raise RuntimeError("Internal error; failed to resolve configuration file path")

        v2_bin = _resolve_v2_bin_path()
        if not Path(v2_bin).exists():
            raise RuntimeError(f"python-v2 binary not found at {v2_bin}")

        config_filepath = sys.argv[1]
        if not Path(config_filepath).exists():
            raise RuntimeError(f"Configuration file not found at {config_filepath}")

        self.coordinator.send_update(
            generator_exec.logging.GeneratorUpdate.factory.log(
                generator_exec.logging.LogUpdate(
                    level=generator_exec.logging.LogLevel.DEBUG,
                    message="Running python-v2 SDK generator...",
                )
            )
        )

        try:
            subprocess.run(
                ["node", "--enable-source-maps", v2_bin, config_filepath],
                capture_output=True,
                text=True,
                check=True,
            )
            self.coordinator.send_update(
                generator_exec.logging.GeneratorUpdate.factory.log(
                    generator_exec.logging.LogUpdate(
                        level=generator_exec.logging.LogLevel.DEBUG,
                        message="Successfully ran python-v2 generator",
                    )
                )
            )
        except subprocess.CalledProcessError as e:
            message = f"Failed to run python-v2 generator; stdout: {e.stdout}, stderr: {e.stderr}"
            self.coordinator.send_update(
                generator_exec.logging.GeneratorUpdate.factory.log(
                    generator_exec.logging.LogUpdate(
                        level=generator_exec.logging.LogLevel.WARN,
                        message=message,
                    )
                )
            )
            raise RuntimeError(message)
