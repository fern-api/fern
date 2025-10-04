import typer
from .pydantic_model_generator import PydanticModelGenerator

from fern_python.cli.generator_cli import GeneratorCli


def main(path_to_config_json: str) -> None:
    pydantic_model_generator = PydanticModelGenerator()
    cli = GeneratorCli(pydantic_model_generator, path_to_config_json)
    cli.run()


if __name__ == "__main__":
    typer.run(main)
