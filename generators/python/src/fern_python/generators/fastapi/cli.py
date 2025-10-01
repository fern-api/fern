import typer
from .fastapi_generator import FastApiGenerator

from fern_python.cli.generator_cli import GeneratorCli


def main(path_to_config_json: str) -> None:
    fast_api_generator = FastApiGenerator()
    cli = GeneratorCli(fast_api_generator, path_to_config_json)
    cli.run()


if __name__ == "__main__":
    typer.run(main)
