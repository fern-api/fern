from generator_exec.resources.config import GeneratorConfig
from generator_exec.resources.logging import (
    ErrorExitStatusUpdate,
    ExitStatusUpdate,
    GeneratorUpdate,
    InitUpdate,
)

from fern_python.generated import ir_types
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

from .abstract_generator import AbstractGenerator


class GeneratorCli:
    def __init__(self, abstract_generator: AbstractGenerator, path_to_config_json: str) -> None:
        self.path_to_config_json = path_to_config_json
        self.abstract_generator = abstract_generator

    def run(self) -> None:
        config = GeneratorConfig.parse_file(self.path_to_config_json)
        generator_exec_wrapper = GeneratorExecWrapper(generator_config=config)
        try:
            ir = ir_types.IntermediateRepresentation.parse_file(config.ir_filepath)

            # TODO: if in publish mode, need to send name of published package
            generator_exec_wrapper.send_update(GeneratorUpdate.factory.init(InitUpdate(packages_to_publish=[])))

            self.abstract_generator.generate(
                generator_exec_wrapper=generator_exec_wrapper, ir=ir, generator_config=config
            )
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.exit_status_update(ExitStatusUpdate.factory.successful())
            )
        except Exception as e:
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.exit_status_update(
                    ExitStatusUpdate.factory.error(ErrorExitStatusUpdate(message=str(e)))
                )
            )
            raise e
