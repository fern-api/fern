import typer


def main(path_to_config_json: str) -> None:
    print(f"Path to config: {path_to_config_json}")


if __name__ == "__main__":
    typer.run(main)
