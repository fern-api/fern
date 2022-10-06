import typer
from generator_exec.resources.config import GeneratorConfig
from generator_exec.resources.logging import (
    ErrorExitStatusUpdate,
    ExitStatusUpdate,
    GeneratorUpdate,
    InitUpdate,
)

from fern_python.generated import ir_types
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators import PydanticModelGenerator


def main(path_to_config_json: str) -> None:
    config = GeneratorConfig.parse_file(path_to_config_json)
    generator_exec_wrapper = GeneratorExecWrapper(generator_config=config)
    try:
        # TODO: if in publish mode, need to send name of published package
        generator_exec_wrapper.send_update(GeneratorUpdate.factory.init(InitUpdate(packages_to_publish=[])))
        ir = ir_types.IntermediateRepresentation.parse_file(config.ir_filepath)
        generator = PydanticModelGenerator(
            intermediate_representation=ir,
            output_filepath=config.output.path,
            generator_exec_wrapper=generator_exec_wrapper,
        )
        generator.run()
        generator_exec_wrapper.send_update(
            GeneratorUpdate.factory.exit_status_update(ExitStatusUpdate.factory.successful())
        )
    except Exception as e:
        generator_exec_wrapper.send_update(
            GeneratorUpdate.factory.exit_status_update(
                ExitStatusUpdate.factory.error(ErrorExitStatusUpdate(message=str(e)))
            )
        )


if __name__ == "__main__":
    typer.run(main)
