import pydantic
import typer

from fern_python.codegen import SourceFile
from fern_python.ir_types import (
    AliasTypeDeclaration,
    ContainerType,
    IntermediateRepresentation,
    MapType,
    Type,
    TypeReference,
)


def main(path_to_config_json: str) -> None:
    print(f"Path to config: {path_to_config_json}")
    map = TypeReference.container(
        ContainerType.map(MapType(key_type=TypeReference.void(), value_type=TypeReference.void()))
    )

    processTypeReference(map)

    optional = TypeReference.container(ContainerType.optional(TypeReference.void()))
    processTypeReference(optional)
    print(optional.json(by_alias=True))

    type = Type.alias(AliasTypeDeclaration(alias_of=map))
    print(type.json(by_alias=True))

    print(map.json(by_alias=True))

    parsedContainer = TypeReference.parse_raw(
        """
    {
        "type": "container",
        "container": {
            "type": "map",
            "keyType": {
                "type": "void"
            },
            "valueType": {
                "type": "void"
            }
        }
    }
    """
    )
    print(parsedContainer.json(by_alias=True))

    parsed = pydantic.parse_file_as(IntermediateRepresentation, "ir.json")
    with open("parsed_ir.json", "w") as f:
        f.write(parsed.json(by_alias=True))

    source_file = SourceFile(module_path=())
    source_file.add_class(class_name="ZachClass")
    source_file.write()


def processTypeReference(x: TypeReference) -> None:
    pass


if __name__ == "__main__":
    typer.run(main)
