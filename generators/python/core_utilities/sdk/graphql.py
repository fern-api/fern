import enum
import json
from typing import Any, AsyncIterator, Dict, List, Optional

from .api_error import ApiError


def _as_graphql_error_list(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [error for error in payload if isinstance(error, dict)]
    if isinstance(payload, dict):
        return [payload]
    return [{"message": str(payload)}] if payload is not None else []


async def subscribe_graphql(
    *,
    url: str,
    query: str,
    variables: Optional[Dict[str, Any]] = None,
    connection_params: Optional[Dict[str, Any]] = None,
) -> AsyncIterator[Any]:
    """
    Open a GraphQL subscription over the ``graphql-transport-ws`` protocol and yield each event's
    ``data`` payload. Auth and other connection metadata are sent in the ``connection_init`` params
    (the standard graphql-ws auth channel). Breaking out of the iterator tears the socket down.
    """
    # Imported dynamically so SDKs without subscriptions don't need the `websockets` dependency and
    # so static type-checkers treat it as untyped (avoids import-not-found / Subprotocol list-item).
    import importlib

    websockets = importlib.import_module("websockets")

    async with websockets.connect(url, subprotocols=["graphql-transport-ws"]) as socket:
        await socket.send(json.dumps({"type": "connection_init", "payload": connection_params or {}}))
        while True:
            ack_message = json.loads(await socket.recv())
            ack_type = ack_message.get("type")
            if ack_type == "connection_ack":
                break
            if ack_type in ("connection_error", "error"):
                raise GraphqlError(errors=_as_graphql_error_list(ack_message.get("payload")))

        await socket.send(
            json.dumps({"type": "subscribe", "id": "1", "payload": {"query": query, "variables": variables or {}}})
        )
        async for raw_message in socket:
            message = json.loads(raw_message)
            message_type = message.get("type")
            if message_type == "next":
                payload = message.get("payload") or {}
                errors = payload.get("errors")
                if errors:
                    raise GraphqlError(errors=errors, data=payload.get("data"))
                yield payload.get("data")
            elif message_type == "error":
                raise GraphqlError(errors=_as_graphql_error_list(message.get("payload")))
            elif message_type == "complete":
                break


class GraphqlSelection:
    """
    Base class for generated fluent selection builders.

    Each generated ``<Type>Selection`` subclass exposes one method per GraphQL field: a scalar
    field records itself, an object field takes a nested selection builder (composed via a
    lambda). The recorded selection is materialized into a GraphQL selection set at request time.
    """

    def __init__(self) -> None:
        self._selection: Dict[str, Any] = {}

    def _render_selection_set(self) -> str:
        return _render_selection_set(self._selection)


def _render_graphql_value(value: Any) -> str:
    """Render a Python value as a GraphQL literal (for inline nested-field arguments)."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, enum.Enum):
        return str(value.value)
    if isinstance(value, (int, float)):
        return json.dumps(value)
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, (list, tuple)):
        return "[" + ", ".join(_render_graphql_value(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ", ".join(f"{key}: {_render_graphql_value(val)}" for key, val in value.items()) + "}"
    return json.dumps(value)


def _render_selection_set(selection: Dict[str, Any]) -> str:
    parts: List[str] = []
    for key, value in selection.items():
        if key.startswith("__on_"):
            type_name = key[len("__on_") :]
            child = value
            parts.append(f"... on {type_name} {child._render_selection_set()}")
        elif value is True:
            parts.append(key)
        elif isinstance(value, tuple):
            child, args = value
            args_str = ""
            if args:
                args_str = "(" + ", ".join(f"{k}: {_render_graphql_value(v)}" for k, v in args.items()) + ")"
            parts.append(f"{key}{args_str} {child._render_selection_set()}")
    if not parts:
        parts.append("__typename")
    return "{ " + " ".join(parts) + " }"


def build_graphql_query(
    *,
    operation_type: str,
    operation_name: str,
    selection_set: str,
    variable_definitions: Optional[str] = None,
    arguments: Optional[str] = None,
) -> str:
    """
    Assemble a complete GraphQL document from a caller's selection set, reusing the operation's
    root variable definitions/arguments (which map to the method's ``args`` parameter). Root
    arguments stay as ``$variables``; nested-field arguments are inlined by the selection builder.
    """
    var_defs = f"({variable_definitions})" if variable_definitions else ""
    args = arguments or ""
    return f"{operation_type.lower()} {operation_name}{var_defs} {{ {operation_name}{args} {selection_set} }}"


class GraphqlError(ApiError):
    """
    Raised when a GraphQL response carries a non-empty top-level ``errors`` array.

    GraphQL is a partial-success protocol: a single response can contain both ``data`` and
    ``errors``. The generated SDK surfaces those errors by raising this exception, which still
    exposes any partial ``data`` that came back alongside them.
    """

    errors: List[Dict[str, Any]]
    data: Optional[Any]

    def __init__(
        self,
        *,
        errors: List[Dict[str, Any]],
        data: Optional[Any] = None,
        status_code: Optional[int] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        super().__init__(status_code=status_code, headers=headers, body={"errors": errors, "data": data})
        self.errors = errors
        self.data = data

    def __str__(self) -> str:
        messages = [
            str(error.get("message", error)) if isinstance(error, dict) else str(error)
            for error in (self.errors or [])
        ]
        joined = "; ".join(messages) if messages else "unknown error"
        return f"GraphQL request failed: {joined}"
