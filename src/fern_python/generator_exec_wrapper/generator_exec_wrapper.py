import typing

from fern.generator_exec.sdk.client.client import FernGeneratorExec
from fern.generator_exec.sdk.resources.config import (
    GeneratorConfig,
    RemoteGeneratorEnvironment,
)
from fern.generator_exec.sdk.resources.logging import GeneratorUpdate, TaskId


class GeneratorExecWrapper:
    def __init__(self, generator_config: GeneratorConfig):
        self.generator_exec_client: typing.Optional[FernGeneratorExec] = None
        self.task_id: typing.Optional[TaskId] = None
        generator_config.environment.visit(local=lambda: (), remote=lambda env: self._init_remote(env))

    def _init_remote(self, env: RemoteGeneratorEnvironment) -> None:
        self.generator_exec_client = FernGeneratorExec(environment=env.coordinator_url_v_2)
        self.task_id = env.id

    def send_update(self, generator_update: GeneratorUpdate) -> None:
        self.send_updates(generator_updates=[generator_update])

    def send_updates(self, generator_updates: typing.List[GeneratorUpdate]) -> None:
        if self.generator_exec_client is not None and self.task_id is not None:
            self.generator_exec_client.logging.send_update(task_id=self.task_id, request=generator_updates)
