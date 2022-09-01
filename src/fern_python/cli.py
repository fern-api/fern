import typer
from fern_python.ir_types import Type


def main(path_to_config_json: str) -> None:
    print(f"Path to config: {path_to_config_json}")
    t = Type.Alias(_type="alias")
    print(t.json(by_alias=True))
    u = Type.parse_obj(t)
    print(u.json(by_alias=True))


if __name__ == "__main__":
    typer.run(main)
