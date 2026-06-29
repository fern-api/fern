"""
GraphQL transport handling for the Python generator.

The Fern IR models an endpoint's ``transport`` as a discriminated union. The published
Python IR SDK (``fern_fern_ir_v67``) currently only wires ``http`` and ``grpc`` into that
union, even though the IR schema itself also defines a ``graphql`` variant. Pydantic v2
therefore *rejects* an IR that carries ``transport: {"type": "graphql"}`` with a
``union_tag_invalid`` error, which would make the IR fail to deserialize entirely.

To stay self-contained (no dependency on republishing the IR SDK), we read the graphql
transport structurally from the raw IR JSON *before* pydantic validates it — mirroring the
"read the transport structurally" approach the TypeScript generator already takes. Each
graphql transport is stashed in :class:`GraphqlTransportRegistry`, keyed by the stable
``endpoint.id``, and the offending field is rewritten to ``{"type": "http"}`` so the rest of
the IR deserializes cleanly. The SDK endpoint generator then consults the registry to decide
whether to emit a GraphQL-flavored method instead of a REST one.
"""

import json
import typing
from dataclasses import dataclass


@dataclass(frozen=True)
class GraphqlTransportInfo:
    """The transport-level information for a single GraphQL endpoint, read from the IR JSON."""

    query: str
    """The pre-built GraphQL query/mutation string sent at runtime."""

    operation_name: str
    """The root field name, used to unwrap the response from ``data[operationName]``."""

    operation_type: str
    """``"QUERY"``, ``"MUTATION"``, or ``"SUBSCRIPTION"``."""

    variable_definitions: typing.Optional[str]
    """e.g. ``"$id: ID!"`` (no surrounding parentheses); ``None``/empty when no arguments."""

    arguments: typing.Optional[str]
    """e.g. ``"(id: $id)"`` (with parentheses); ``None``/empty when no arguments."""

    @property
    def is_subscription(self) -> bool:
        return self.operation_type.upper() == "SUBSCRIPTION"


class GraphqlTransportRegistry:
    """
    Process-wide registry mapping ``endpoint.id`` -> :class:`GraphqlTransportInfo`.

    Populated by :func:`load_ir_with_graphql_transports_sanitized` during IR loading and read
    by the SDK endpoint generator. A module-level singleton is sufficient because each
    generation runs in its own process.
    """

    _by_endpoint_id: typing.Dict[str, GraphqlTransportInfo] = {}

    @classmethod
    def register(cls, endpoint_id: str, info: GraphqlTransportInfo) -> None:
        cls._by_endpoint_id[endpoint_id] = info

    @classmethod
    def get(cls, endpoint_id: str) -> typing.Optional[GraphqlTransportInfo]:
        return cls._by_endpoint_id.get(endpoint_id)

    @classmethod
    def has_any(cls) -> bool:
        return len(cls._by_endpoint_id) > 0

    @classmethod
    def clear(cls) -> None:
        cls._by_endpoint_id = {}


def _coerce_optional_str(value: typing.Any) -> typing.Optional[str]:
    return value if isinstance(value, str) and value != "" else None


def _rewrite_graphql_transport_to_http(holder: typing.Dict[str, typing.Any]) -> typing.Optional[GraphqlTransportInfo]:
    """
    If ``holder["transport"]`` is a graphql transport, parse it into a :class:`GraphqlTransportInfo`
    and rewrite the field to ``{"type": "http"}`` so pydantic can deserialize it. Returns the parsed
    info (or ``None`` if there was no graphql transport).
    """
    transport = holder.get("transport")
    if not isinstance(transport, dict) or transport.get("type") != "graphql":
        return None
    info = GraphqlTransportInfo(
        query=transport.get("query") or "",
        operation_name=transport.get("operationName") or "",
        operation_type=transport.get("operationType") or "QUERY",
        variable_definitions=_coerce_optional_str(transport.get("variableDefinitions")),
        arguments=_coerce_optional_str(transport.get("arguments")),
    )
    holder["transport"] = {"type": "http"}
    return info


def load_ir_with_graphql_transports_sanitized(ir_filepath: str) -> typing.Dict[str, typing.Any]:
    """
    Read the IR JSON from disk, stash every graphql endpoint transport in
    :class:`GraphqlTransportRegistry` (keyed by ``endpoint.id``), rewrite those transports to
    ``http`` so the IR deserializes, and return the sanitized dict ready for pydantic.
    """
    with open(ir_filepath, encoding="utf-8") as file:
        ir_dict: typing.Dict[str, typing.Any] = json.load(file)

    GraphqlTransportRegistry.clear()

    services = ir_dict.get("services")
    if isinstance(services, dict):
        for service in services.values():
            if not isinstance(service, dict):
                continue
            # Service-level transport is unused by the SDK generator, but still must be
            # sanitized so the union deserializes.
            _rewrite_graphql_transport_to_http(service)
            endpoints = service.get("endpoints")
            if not isinstance(endpoints, list):
                continue
            for endpoint in endpoints:
                if not isinstance(endpoint, dict):
                    continue
                info = _rewrite_graphql_transport_to_http(endpoint)
                endpoint_id = endpoint.get("id")
                if info is not None and isinstance(endpoint_id, str):
                    GraphqlTransportRegistry.register(endpoint_id, info)

    return ir_dict
