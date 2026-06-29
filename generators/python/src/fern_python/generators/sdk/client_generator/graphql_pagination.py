import typing
from dataclasses import dataclass

import fern.ir.resources as ir_types
from fern_python.cli.graphql_transport import GraphqlTransportRegistry
from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.utils.name_resolver import get_name_from_wire_value, get_wire_value, resolve_name


@dataclass
class GraphqlConnectionInfo:
    """Relay-connection metadata for a GraphQL query endpoint, used to generate `paginate.<field>`."""

    method_name: str
    node_type: ir_types.TypeReference
    edges_field: typing.Optional[str]
    node_field: typing.Optional[str]
    nodes_field: typing.Optional[str]
    page_info_field: str
    has_next_field: str
    end_cursor_field: str
    forward_properties: typing.List[ir_types.ObjectProperty]


def _unwrap_to_type_id(type_reference: ir_types.TypeReference) -> typing.Optional[str]:
    return type_reference.visit(
        container=lambda container: container.visit(
            list_=_unwrap_to_type_id,
            optional=_unwrap_to_type_id,
            nullable=_unwrap_to_type_id,
            set_=_unwrap_to_type_id,
            map_=lambda _m: None,
            literal=lambda _l: None,
        ),
        named=lambda named: named.type_id,
        primitive=lambda _p: None,
        unknown=lambda: None,
    )


def _resolve_object(
    context: SdkGeneratorContext, type_reference: ir_types.TypeReference
) -> typing.Optional[ir_types.ObjectTypeDeclaration]:
    type_id = _unwrap_to_type_id(type_reference)
    if type_id is None:
        return None
    decl = context.ir.types.get(type_id)
    if decl is None:
        return None
    return decl.shape.visit(
        object=lambda obj: obj,
        alias=lambda alias: _resolve_object(context, alias.alias_of),
        enum=lambda _e: None,
        union=lambda _u: None,
        undiscriminated_union=lambda _u: None,
    )


def _find_property(
    obj: ir_types.ObjectTypeDeclaration, wire_value: str
) -> typing.Optional[ir_types.ObjectProperty]:
    for prop in list(obj.properties) + list(obj.extended_properties or []):
        if get_wire_value(prop.name) == wire_value:
            return prop
    return None


def _snake(prop: ir_types.ObjectProperty) -> str:
    return resolve_name(get_name_from_wire_value(prop.name)).snake_case.safe_name


def _endpoint_accepts_after(endpoint: ir_types.HttpEndpoint) -> bool:
    if endpoint.request_body is None:
        return False
    return endpoint.request_body.visit(
        inlined_request_body=lambda body: any(get_wire_value(p.name) == "after" for p in body.properties),
        reference=lambda _r: False,
        file_upload=lambda _f: False,
        bytes=lambda _b: False,
    )


def _forward_properties(endpoint: ir_types.HttpEndpoint) -> typing.List[ir_types.ObjectProperty]:
    if endpoint.request_body is None:
        return []
    return endpoint.request_body.visit(
        inlined_request_body=lambda body: [p for p in body.properties if get_wire_value(p.name) != "after"],
        reference=lambda _r: [],
        file_upload=lambda _f: [],
        bytes=lambda _b: [],
    )


def detect_connection(
    context: SdkGeneratorContext, endpoint: ir_types.HttpEndpoint, method_name: str
) -> typing.Optional[GraphqlConnectionInfo]:
    """
    Detects whether a GraphQL query endpoint returns a Relay connection (a `pageInfo` with
    `hasNextPage`+`endCursor`, plus `edges[].node` or a `nodes` list) and accepts an `after`
    cursor argument. Returns the metadata needed to generate its auto-paginator, else None.
    """
    transport = GraphqlTransportRegistry.get(endpoint.id)
    if transport is None or transport.is_subscription:
        return None
    if not _endpoint_accepts_after(endpoint):
        return None
    if endpoint.response is None or endpoint.response.body is None:
        return None
    response_type = endpoint.response.body.visit(
        json=lambda json_response: json_response.visit(
            response=lambda response: response.response_body_type,
            nested_property_as_response=lambda response: response.response_body_type,
        ),
        file_download=lambda _: None,
        text=lambda _: None,
        bytes=lambda _: None,
        streaming=lambda _: None,
        stream_parameter=lambda _: None,
    )
    if response_type is None:
        return None
    connection = _resolve_object(context, response_type)
    if connection is None:
        return None

    page_info_prop = _find_property(connection, "pageInfo")
    page_info = _resolve_object(context, page_info_prop.value_type) if page_info_prop is not None else None
    if page_info is None:
        return None
    has_next_prop = _find_property(page_info, "hasNextPage")
    end_cursor_prop = _find_property(page_info, "endCursor")
    if has_next_prop is None or end_cursor_prop is None:
        return None

    edges_field: typing.Optional[str] = None
    node_field: typing.Optional[str] = None
    nodes_field: typing.Optional[str] = None
    edges_prop = _find_property(connection, "edges")
    if edges_prop is not None:
        edge_obj = _resolve_object(context, edges_prop.value_type)
        node_prop = _find_property(edge_obj, "node") if edge_obj is not None else None
        if node_prop is not None:
            edges_field = _snake(edges_prop)
            node_field = _snake(node_prop)
            node_type = node_prop.value_type
    if edges_field is None:
        nodes_prop = _find_property(connection, "nodes")
        if nodes_prop is None:
            return None
        nodes_field = _snake(nodes_prop)
        node_type = nodes_prop.value_type

    return GraphqlConnectionInfo(
        method_name=method_name,
        node_type=node_type,
        edges_field=edges_field,
        node_field=node_field,
        nodes_field=nodes_field,
        page_info_field=_snake(page_info_prop),
        has_next_field=_snake(has_next_prop),
        end_cursor_field=_snake(end_cursor_prop),
        forward_properties=_forward_properties(endpoint),
    )
