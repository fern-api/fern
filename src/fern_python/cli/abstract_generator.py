from abc import ABC, abstractmethod

from generator_exec.resources.config import GeneratorConfig

from fern_python.generated.ir_types import IntermediateRepresentation
from fern_python.generator_exec_wrapper import GeneratorExecWrapper


class AbstractGenerator(ABC):
    @abstractmethod
    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ) -> None:
        pass
