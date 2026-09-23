"""
A map query parameter is spread into the generated `params` dict, so every entry becomes a
parameter of its own. The runtime then runs `encode_query(jsonable_encoder(params))`, which is
why the decision is made here, by IR type, and not in the encoder: `jsonable_encoder` turns a
declared pydantic model into a dict before the encoder could tell it apart from a map.
"""

from types import SimpleNamespace
from typing import Any, List, Optional, cast

import fern.ir.resources as ir_types

import pydantic
from core_utilities.shared.jsonable_encoder import jsonable_encoder
from core_utilities.shared.query_encoder import encode_query
from fern_python.codegen import AST
from fern_python.codegen.node_writer_impl import NodeWriterImpl
from fern_python.codegen.reference_resolver import ReferenceResolver
from fern_python.generators.sdk.client_generator.endpoint_function_generator import (
    get_exploded_map_query_parameter,
)

STRING = ir_types.TypeReference.factory.primitive(ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None))
MAP = ir_types.TypeReference.factory.container(
    ir_types.ContainerType.factory.map_(ir_types.MapType(key_type=STRING, value_type=STRING))
)


def _optional(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    return ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.optional(type_reference))


def _named(type_id: str) -> ir_types.TypeReference:
    return ir_types.TypeReference.factory.named(
        ir_types.NamedType(
            type_id=type_id,
            fern_filepath=ir_types.FernFilepath(all_parts=[], package_path=[], file=None),
            name=type_id,
            display_name=None,
            default=None,
            inline=None,
        )
    )


def _context(**shapes: Any) -> Any:
    def get_declaration_for_type_id(type_id: str) -> Any:
        return SimpleNamespace(shape=shapes[type_id])

    return SimpleNamespace(
        pydantic_generator_context=SimpleNamespace(get_declaration_for_type_id=get_declaration_for_type_id)
    )


def _query_parameter(
    value_type: ir_types.TypeReference, *, allow_multiple: bool = False, explode: Optional[bool] = None
) -> ir_types.QueryParameter:
    return ir_types.QueryParameter(
        name=ir_types.NameAndWireValue(wire_value="filter", name="filter"),
        value_type=value_type,
        allow_multiple=allow_multiple,
        explode=explode,
    )


def _write(value_type: ir_types.TypeReference, context: Any = None) -> str:
    exploded = get_exploded_map_query_parameter(context or _context(), _query_parameter(value_type))
    assert exploded is not None
    # a plain expression never resolves a reference
    resolver = cast(ReferenceResolver, SimpleNamespace())
    writer = NodeWriterImpl(should_format=False, should_include_header=False, reference_resolver=resolver)
    exploded.write(writer, AST.Expression("filter"))
    return writer.to_str().strip()


ALIAS_TO_MAP = ir_types.Type.factory.alias(
    ir_types.AliasTypeDeclaration(
        alias_of=MAP,
        resolved_type=ir_types.ResolvedTypeReference.factory.container(
            ir_types.ContainerType.factory.map_(ir_types.MapType(key_type=STRING, value_type=STRING))
        ),
    )
)
OBJECT = SimpleNamespace(get_as_union=lambda: SimpleNamespace(type="object"))


def test_a_map_is_spread() -> None:
    assert _write(MAP) == "**filter"


def test_an_optional_map_is_spread_behind_a_none_guard() -> None:
    assert _write(_optional(MAP)) == "**(filter if filter is not None else {})"


def test_an_alias_to_a_map_is_spread() -> None:
    assert _write(_optional(_named("Labels")), _context(Labels=ALIAS_TO_MAP)) == (
        "**(filter if filter is not None else {})"
    )


def test_a_declared_object_is_not_spread() -> None:
    assert get_exploded_map_query_parameter(_context(User=OBJECT), _query_parameter(_named("User"))) is None


def test_allow_multiple_and_explode_false_are_not_spread() -> None:
    assert get_exploded_map_query_parameter(_context(), _query_parameter(MAP, allow_multiple=True)) is None
    assert get_exploded_map_query_parameter(_context(), _query_parameter(MAP, explode=False)) is None


class User(pydantic.BaseModel):
    name: str
    tags: List[str]


def test_the_generated_params_through_the_runtime() -> None:
    # What a generated client sends for `user: User` next to a spread `filter` map: the
    # declared object keeps its prefix, the map's entries are parameters of their own.
    filter = {"category": "books", "createdDate:gte": "2023-01-01"}
    params = {"user": User(name="ann", tags=["a", "b"]), **filter}
    assert encode_query(jsonable_encoder(params)) == [
        ("user[name]", "ann"),
        ("user[tags]", "a"),
        ("user[tags]", "b"),
        ("category", "books"),
        ("createdDate:gte", "2023-01-01"),
    ]
