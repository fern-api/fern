from dataclasses import dataclass

from fern_python.codegen import AST


@dataclass(frozen=True)
class PydanticField:
    name: str
    type_hint: AST.TypeHint
    json_field_name: str
