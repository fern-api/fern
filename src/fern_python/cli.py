import typer

from fern_python.generated import generator_exec


def main(path_to_config_json: str) -> None:
    config = generator_exec.config.GeneratorConfig.parse_file(path_to_config_json)
    print(config)


if __name__ == "__main__":
    typer.run(main)
