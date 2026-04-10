import typing

from fdr import FdrClientEnvironment
from fdr.client import FdrClient
from fern.generator_exec.client import FernGeneratorExec
from fern.generator_exec.config import GeneratorConfig, RemoteGeneratorEnvironment
from fern.generator_exec.logging import GeneratorUpdate, TaskId


class GeneratorExecWrapper:
    def __init__(self, generator_config: GeneratorConfig):
        self.generator_exec_client: typing.Optional[FernGeneratorExec] = None
        self.fdr_client: typing.Optional[FdrClient] = None
        self.task_id: typing.Optional[TaskId] = None
        generator_config.environment.visit(local=lambda: (), remote=lambda env: self._init_remote(env))

    def _init_remote(self, env: RemoteGeneratorEnvironment) -> None:
        self.generator_exec_client = FernGeneratorExec(base_url=env.coordinator_url_v_2)
        self.task_id = env.id
        if self._is_in_development(env):
            self.fdr_client = FdrClient(base_url="https://registry-dev2.buildwithfern.com")
        else:
            self.fdr_client = FdrClient(environment=FdrClientEnvironment.PROD)

    def _is_in_development(self, env: RemoteGeneratorEnvironment) -> bool:
        return env.coordinator_url_v_2.endswith("dev2.buildwithfern.com")

    def send_update(self, generator_update: GeneratorUpdate) -> None:
        self.send_updates(generator_updates=[generator_update])

    def send_updates(self, generator_updates: typing.List[GeneratorUpdate]) -> None:
        if self.generator_exec_client is not None and self.task_id is not None:
            self.generator_exec_client.logging.send_update(task_id=self.task_id, request=generator_updates)
