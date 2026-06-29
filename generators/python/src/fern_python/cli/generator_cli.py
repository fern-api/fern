import sys

from .abstract_generator import AbstractGenerator
from .graphql_transport import load_ir_with_graphql_transports_sanitized
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

import fern.ir.resources as ir_types
from fern.generator_exec.config import GeneratorConfig
from fern.generator_exec.logging import (
    ErrorExitStatusUpdate,
    ExitStatusUpdate,
    GeneratorUpdate,
    InitUpdateV2,
    RegistryType,
    SuccessfulStatusUpdate,
)

# TODO(abelardo): iterate on the example logic to trim back IR complexity
sys.setrecursionlimit(2000)


class GeneratorCli:
    def __init__(self, abstract_generator: AbstractGenerator, path_to_config_json: str) -> None:
        self.path_to_config_json = path_to_config_json
        self.abstract_generator = abstract_generator

    def run(self) -> None:
        config = GeneratorConfig.parse_file(self.path_to_config_json)
        generator_exec_wrapper = GeneratorExecWrapper(generator_config=config)
        try:
            # GraphQL endpoints carry a `graphql` transport that the published Python IR SDK does
            # not yet wire into the Transport union, so we read those transports structurally and
            # rewrite them to `http` before pydantic validates the IR. See graphql_transport.py.
            ir = ir_types.IntermediateRepresentation.parse_obj(
                load_ir_with_graphql_transports_sanitized(config.ir_filepath)
            )

            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.init_v_2(
                    InitUpdateV2(
                        publishing_to_registry=config.output.mode.visit(
                            publish=lambda x: RegistryType.PYPI,
                            github=lambda x: None,
                            download_files=lambda: None,
                        )
                    )
                )
            )

            self.abstract_generator.generate_project(
                generator_exec_wrapper=generator_exec_wrapper,
                ir=ir,
                generator_config=config,
            )
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.exit_status_update(
                    ExitStatusUpdate.factory.successful(SuccessfulStatusUpdate())
                )
            )
        except Exception as e:
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.exit_status_update(
                    ExitStatusUpdate.factory.error(ErrorExitStatusUpdate(message=str(e)))
                )
            )
            raise e
