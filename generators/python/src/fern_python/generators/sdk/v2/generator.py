import subprocess
import sys
from pathlib import Path

import fern.generator_exec as generator_exec

from fern_python.generator_exec_wrapper import GeneratorExecWrapper

# v2BinPath is the path to the python-v2 binary included in the SDK
# generator docker image.
V2_BIN_PATH = "/bin/python-v2"


class PythonV2Generator:
    """Generator represents a shim used to run the python-v2 SDK generator."""

    def __init__(self, coordinator: GeneratorExecWrapper):
        self.coordinator = coordinator

    def run(self) -> None:
        if len(sys.argv) < 2:
            raise RuntimeError("Internal error; failed to resolve configuration file path")

        if not Path(V2_BIN_PATH).exists():
            raise RuntimeError(f"python-v2 binary not found at {V2_BIN_PATH}")

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
                ["node", "--enable-source-maps", V2_BIN_PATH, config_filepath],
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
