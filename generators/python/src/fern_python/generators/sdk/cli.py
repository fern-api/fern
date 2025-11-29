import typer

from fern_python.cli.generator_cli import GeneratorCli
from fern_python.generators.sdk.sdk_generator import SdkGenerator


def main(path_to_config_json: str) -> None:
    sdk_generator = SdkGenerator()
    cli = GeneratorCli(sdk_generator, path_to_config_json)
    cli.run()


if __name__ == "__main__":
    typer.run(main)
