from .name_resolver import get_name_from_wire_value, get_original_name, get_wire_value, resolve_name, resolve_wire_name
from .pascal_case import pascal_case
from .snake_case import snake_case


def __getattr__(name: str) -> object:  # type: ignore[return]
    if name == "build_snippet_writer":
        from .build_snippet_writer import build_snippet_writer

        return build_snippet_writer
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "build_snippet_writer",
    "get_name_from_wire_value",
    "get_original_name",
    "get_wire_value",
    "pascal_case",
    "resolve_name",
    "resolve_wire_name",
    "snake_case",
]
